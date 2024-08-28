defmodule Buildel.Blocks.BraveSearch do
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool, parallel: ["query"]

  alias Buildel.Blocks.Fields.EditorField

  # Config

  @impl true
  def options() do
    %{
      type: "brave_search",
      description: "Used for searching web using Brave Search",
      groups: ["tools"],
      inputs: [
        Block.text_input("query")
      ],
      outputs: [Block.text_output()],
      ios: [Block.io("tool", "worker")],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_key"],
            "properties" =>
              Jason.OrderedObject.new(
                country: %{
                  "type" => "string",
                  "title" => "Country",
                  "description" => "The search query country, where the results come from.",
                  "default" => "us",
                  "minLength" => 2,
                  "maxLength" => 2,
                  "readonly" => true
                },
                limit: %{
                  "type" => "number",
                  "title" => "Limit",
                  "description" => "Results limit",
                  "default" => 5,
                  "minimum" => 1,
                  "maximum" => 10,
                  "step" => 1,
                  "readonly" => true
                },
                api_key:
                  secret_schema(%{
                    "title" => "API key",
                    "description" => " Brave Search API key."
                  }),
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "{{config.block_name}} Search 📑: \"{{config.args}}\"\n",
                    description: "How to format calling of api call through tool interface.",
                    display_when: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    },
                    minLength: 1
                  })
              )
          })
      }
    }
  end

  # Server

  @impl true
  def setup(%{opts: opts} = state) do
    {:ok,
     state
     |> Map.put(
       :call_formatter,
       opts |> Map.get(:call_formatter, "Search 📑: \"{{config.args}}\"\n")
     )}
  end

  defp search(query, state) do
    state = send_stream_start(state)

    uri =
      URI.parse("https://api.search.brave.com/res/v1/web/search")
      |> URI.append_query("q=#{URI.encode(query)}")
      |> URI.append_query("count=#{state.opts.limit}")
      |> URI.append_query("country=#{state.opts.country}")

    api_key = block_context().get_secret_from_context(state.context_id, state.opts.api_key)

    response =
      Req.new(url: URI.to_string(uri))
      |> Req.Request.put_header("X-Subscription-Token", api_key)
      |> Req.get()

    case response do
      {:ok, %Req.Response{status: 200, body: %{"web" => web}}} ->
        res =
          Enum.map(web["results"], fn result ->
            %{
              title: result["title"],
              url: result["url"],
              description: result["description"]
            }
          end)
          |> Jason.encode!()

        {res, output(state, "output", {:text, res})}

      _ ->
        send_error(state, "Unknown error")
        state = state |> send_stream_stop()
        {"Unknown error", state}
    end
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "query",
          description: "Search the web.",
          parameters_schema: %{
            type: "object",
            properties: %{
              query: %{
                type: "string",
                description: "The search query."
              }
            },
            required: ["query"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  @impl true
  def handle_input("query", {_topic, :text, text, _metadata}, state) do
    {_content, state} = search(text, state)
    state
  end

  @impl true
  def handle_tool("tool", "query", {_topic, :text, args, _}, state) do
    search(args["query"], state)
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end
end
