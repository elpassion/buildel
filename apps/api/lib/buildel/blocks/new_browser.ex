defmodule Buildel.Blocks.NewBrowserTool do
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Blocks.Utils.Injectable
  alias EditorField.Suggestion
  alias Buildel.FlattenMap
  alias Buildel.Crawler
  use Buildel.Blocks.NewBlock
  use Buildel.Blocks.NewBlock.HttpApi

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

  defoption(:host, %{
    type: "string",
    title: "Host",
    description: "The allowed host for the URL. Regex is supported.",
    default: "",
    readonly: true,
    minLength: 1
  })

  defoption(:headers, EditorField.new(%{
    title: "Headers",
    description:
      "Valid JSON object of the headers to be sent with the request. i.e. `{\"Content-Type\": \"application/json\"}`.",
    editorLanguage: "json",
    default: "{}",
    minLength: 1,
    suggestions: [
      Suggestion.metadata(),
      Suggestion.secrets()
    ]
  }))

  deftool(:url,
    description: "Browse a website and extract information.",
    schema: %{
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
  )


  def setup(state) do
    flattened_metadata =
      FlattenMap.flatten(state.block.opts.metadata)

    available_metadata = Injectable.used_metadata_keys([option(state, :headers)])
                         |> Enum.reduce(%{}, fn key, acc ->
      acc
      |> Map.put(key, flattened_metadata[key])
    end)

    aviailable_secrets =  Injectable.used_secrets_keys([option(state, :headers)])
                          |> Enum.reduce(%{}, fn secret, acc ->
      acc
      |> Map.put(secret, secret(state, secret))
    end)


    {:ok, state
          |> Map.put(:available_metadata, available_metadata)
          |> Map.put(:available_secrets, aviailable_secrets)}
  end


  def handle_input(:url, %Message{type: :json, message: message_message} = message, state)
      when is_list(message_message) do
    send_stream_start(state, :output, message)

    %{state: state, pages: pages} =
      Enum.reduce(message_message, %{state: state, pages: []}, fn
        url, %{state: state, pages: pages} ->
          with {:ok, true} <- does_url_match_host(String.trim(url, "\""), Regex.compile!(option(state, :host))),
               {:ok, response, state} <- visit_url(state, url) do
            pages = [{:ok, response} | pages]
            %{state: state, pages: pages}
          else
            {:ok, false} ->
              pages = [{:error, "URL #{message.message} does not match host #{option(state, :host)}"} | pages]
              %{state: state, pages: pages}
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

    with {:ok, true} <- does_url_match_host(String.trim(message.message, "\""), Regex.compile!(option(state, :host))),
         {:ok, response, state} <- visit_url(state, message.message) do
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
      {:ok, false} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("URL #{message.message} does not match host #{option(state, :host)}")
        )

        send_stream_stop(state, :output, message)
        {:error, "URL #{message.message} does not match host #{option(state, :host)}", state}

      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, message)
        {:error, reason, state}
    end
  end


  def handle_tool_call(:url, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, true} <- does_url_match_host(String.trim(args["url"], "\""), Regex.compile!(option(state, :host))),
         {:ok, response, state} <- visit_url(state, args["url"]) do

      response = message |> Message.set_type(:text) |> Message.set_message(response)

      output(
        state,
        :output,
        response
      )

      {:ok, response, state}
    else
      {:ok, false} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("URL #{args.url} does not match host #{option(state, :host)}")
        )

        send_stream_stop(state, :output, message)
        {:error, "URL #{args.url} does not match host #{option(state, :host)}", state}

      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

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
             url_filter: fn inc_url -> inc_url |> String.contains?(uri.host) end,
             client: httpApi(),
             headers: fill_headers_with_available_metadata_and_secrets(state)
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

  defp fill_headers_with_available_metadata_and_secrets(state) do
    headers = option(state, :headers) |> Jason.decode!()

    flatten = %{metadata: state.available_metadata, secrets: state.available_secrets}
              |> FlattenMap.flatten()
              |> Enum.reduce(headers, fn
      {key, value}, acc when is_number(value) ->
         acc |> Enum.map(fn {k, v} -> {k, String.replace(v, "{{#{key}}}", to_string(value))} end)
      {key, value}, acc when is_binary(value) ->
        acc |> Enum.map(fn {k, v} -> {k, String.replace(v, "{{#{key}}}", to_string(value))} end)
      {key, value}, acc when is_map(value) ->
        acc |> Enum.map(fn {k, v} -> {k, String.replace(v, "{{#{key}}}", Jason.encode!(value))} end)
      {key, value}, acc when is_list(value) ->
        acc |> Enum.map(fn {k, v} -> {k, String.replace(v, "{{#{key}}}", Jason.encode!(value))} end)
      _, acc -> acc
    end)
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

  defp does_url_match_host(_, "") do
    {:ok, true}
  end

  defp does_url_match_host(url, %Regex{} = host) do
    IO.inspect(url, label: "url")
    case URI.parse(url) do
      %URI{host: nil} -> {:ok, false}
      %URI{host: uri_host} ->
        if Regex.match?(host, uri_host) do
          {:ok, true}
        else
          {:ok, false}
        end
      _ ->
        {:ok, false}
    end
  end

  defp does_url_match_host(_, _) do
    {:ok, false}
  end
end
