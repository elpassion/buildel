defmodule Buildel.Blocks.Browser do
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

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

  defp url(url) do
    with {:ok, crawl} when length(crawl.pages) != 0 <-
           Crawler.crawl(url,
             max_depth: 1,
             url_filter: fn inc_url -> inc_url |> String.contains?(URI.parse(url).host) end
           ),
         {:ok, path} <- Temp.path(%{suffix: ".html"}),
         :ok <- File.write(path, List.first(crawl.pages).body),
         workflow <- Buildel.DocumentWorkflow.new(),
         document when is_list(document) <-
           Buildel.DocumentWorkflow.read(workflow, {path, %{type: "text/html"}}) do
      content =
        Buildel.DocumentWorkflow.build_node_chunks(workflow, document)
        |> Enum.map(&Map.get(&1, :value))
        |> Enum.join(" ")

      [
        {:output, "output", {:text, content, %{}}},
        {:output, "file_output",
         {:binary, path,
          %{
            file_id: UUID.uuid4(),
            file_name: url,
            file_type: "text/html"
          }}}
      ]
    else
      {:error, %Crawler.Crawl{} = crawl} ->
        {:error, crawl.error}

      {:ok, %Crawler.Crawl{}} ->
        {:error, "No content found"}

      {:error, reason} ->
        {:error, reason}

      _ ->
        {:error, "Unknown error"}
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
                description: "The URL to browse."
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

  def handle_input("url", {_topic, :text, text, _metadata}) do
    [
      {:start_stream, "output"},
      url(text),
      {:stop_stream, "output"}
    ]
  end

  @impl true
  def handle_tool("tool", "url", {:text, args, _}, _state) do
    [
      {:start_stream, "output"},
      {:cast,
       fn _ ->
         response = url(args["url"])

         [
           {:output, "output", {:text, response, %{}}},
           {:respond, "tool", {:text, response, %{}}}
         ]
       end},
      {:stop_stream, "output"}
    ]
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
