defmodule Buildel.Blocks.NewBrowserTool do
  alias Buildel.Crawler
  use Buildel.Blocks.NewBlock

  defblock(:browser,
    description: "Used for browsing a website and extracting information",
    groups: ["tools"]
  )

  definput(:url,
    schema: %{
      "anyOf" => [%{"type" => "string"}, %{"type" => "array", "items" => %{"type" => "string"}}]
    }
  )

  defoutput(:output, schema: %{})

  def handle_input(:url, %Message{type: :json, message: message_message} = message, state)
      when is_list(message_message) do
    send_stream_start(state, :output, message)

    %{state: state, pages: pages} =
      Enum.reduce(message_message, %{state: state, pages: []}, fn url,
                                                                  %{state: state, pages: pages} ->
        with {:ok, response, state} <- visit_url(state, url) do
          pages = [{:ok, response} | pages]
          %{state: state, pages: pages}
        else
          {:error, reason, state} ->
            pages = [{:error, reason} | pages]
            %{state: state, pages: pages}
        end
      end)

    output(
      state,
      :output,
      message
      |> Message.from_message()
      |> Message.set_type(:json)
      |> Message.set_message(
        pages
        |> Enum.map(fn {status, body} -> "#{status}\n#{body}" end)
        |> Enum.reverse()
      )
    )

    {:ok, state}
  end

  def handle_input(:url, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, response, state} <- visit_url(state, message.message) do
      output(
        state,
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:json)
        |> Message.set_message(response)
      )

      {:ok, state}
    else
      {:error, reason, state} ->
        send_error(state, reason)
        send_stream_stop(state, :output, message)
        {:error, reason, state}
    end
  end

  defp visit_url(state, url) do
    with {:ok, url} <- build_url(url),
         {:ok, response, state} <- crawl(state, url) do
      {:ok, response, state}
    else
      {:error, reason} -> {:error, reason, state}
      e -> e
    end
  end

  @spec crawl(map(), String.t()) :: {:ok, String.t(), map()} | {:error, String.t(), map()}
  defp crawl(state, url) do
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
        |> Enum.join("\n")

      {:ok, content, state}
    else
      {:error, %Crawler.Crawl{} = crawl} ->
        {:error, to_string(crawl.error), state}

      {:ok, %Crawler.Crawl{}} ->
        {:error, "No content found", state}

      {:error, reason} ->
        {:error, to_string(reason), state}
    end
  end

  defp build_url(url) do
    with {:ok, uri} <- URI.new(url),
         {:ok, _} <- validate_scheme(uri.scheme) do
      {:ok, url}
    end
  end

  defp validate_scheme(schema) do
    case schema do
      "http" -> {:ok, "http"}
      "https" -> {:ok, "https"}
      _ -> {:error, "Invalid schema"}
    end
  end
end
