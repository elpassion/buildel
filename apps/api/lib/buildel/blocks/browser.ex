defmodule Buildel.Blocks.Browser do
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool, parallel: ["url"]

  alias Buildel.Crawler
  alias Buildel.Blocks.Fields.EditorField

  # Config

  @impl true
  def options() do
    %{
      type: "browser",
      description: "Used for browsing a website and extracting information",
      groups: ["tools"],
      inputs: [
        Block.text_input("url")
      ],
      outputs: [Block.text_output(), Block.file_output("file_output")],
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
            "required" => [],
            "properties" =>
              Jason.OrderedObject.new(
                call_formatter:
                  EditorField.call_formatter(%{
                    default: "{{config.block_name}} Browse 📑: \"{{config.args}}\"\n",
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
       opts |> Map.get(:call_formatter, "Browse 📑: \"{{config.args}}\"\n")
     )}
  end

  defp url(url, state) do
    state = send_stream_start(state)

    uri = URI.parse(url)

    with {:ok, crawl} when length(crawl.pages) != 0 <-
           Crawler.crawl(url,
             max_depth: 1,
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end
           ),
         {:ok, path} <- Temp.path(%{suffix: ".md"}),
         :ok <-
           File.write(
             path,
             List.first(crawl.pages).body |> Html2Markdown.convert()
           ),
         workflow <- Buildel.DocumentWorkflow.new(),
         document when is_list(document) <-
           Buildel.DocumentWorkflow.read(workflow, {path, %{type: "text/markdown"}}) do
      content =
        Buildel.DocumentWorkflow.build_node_chunks(workflow, document)
        |> Enum.map(&Map.get(&1, :value))
        |> Enum.join(" ")

      state = output(state, "output", {:text, content})

      state =
        output(state, "file_output", {:binary, path}, %{
          metadata: %{
            file_id: UUID.uuid4(),
            file_name: url,
            file_type: "text/html"
          }
        })

      {content, state}
    else
      {:error, %Crawler.Crawl{} = crawl} ->
        send_error(state, crawl.error)
        state = state |> send_stream_stop()
        {to_string(crawl.error), state}

      {:ok, %Crawler.Crawl{}} ->
        send_error(state, "No content found")
        state = state |> send_stream_stop()
        {"No content found", state}

      {:error, reason} ->
        send_error(state, reason)
        state = state |> send_stream_stop()
        {to_string(reason), state}

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
          name: "url",
          description: "Browse a website and extract information.",
          parameters_schema: %{
            type: "object",
            properties: %{
              url: %{
                type: "string",
                description:
                  "The URL to browse. Pass full URL including protocol like https://url.com"
              }
            },
            required: ["url"]
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
  def handle_input("url", {_topic, :text, text, _metadata}, state) do
    {_content, state} = url(text, state)
    state
  end

  @impl true
  def handle_tool("tool", "url", {_topic, :text, args, _}, state) do
    url(args["url"], state)
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
