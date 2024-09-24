defmodule Buildel.Blocks.NewApiCallTool do
  alias Buildel.Blocks.Fields.EditorField
  alias EditorField.Suggestion
  use Buildel.Blocks.NewBlock

  defblock(:api_call_tool,
    description: "Tool used to call HTTP APIs.",
    groups: ["tools", "text"]
  )

  definput(:args, schema: %{"type" => "object"})
  defoutput(:output, schema: %{})

  defoption(:method, %{
    type: "string",
    title: "Method",
    description: "The HTTP method to use for the request.",
    enum: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    enumPresentAs: "radio",
    default: "GET",
    readonly: true
  })

  defoption(:url, %{
    type: "string",
    title: "URL",
    description:
      "The URL to send the request to. If you want to use a variable, use `{{variable_name}}`. Notice the double curly braces!",
    minLength: 1,
    readonly: true
  })

  defoption(
    :parameters,
    EditorField.new(%{
      title: "Parameters",
      description:
        "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1,
      readonly: true
    })
  )

  defoption(
    :headers,
    EditorField.new(%{
      title: "Headers",
      description:
        "Valid JSON object of the headers to be sent with the request. i.e. `{\"Content-Type\": \"application/json\"}`.",
      editorLanguage: "json",
      default: "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}",
      minLength: 1,
      suggestions: [
        Suggestion.inputs(),
        Suggestion.metadata(),
        Suggestion.secrets()
      ]
    })
  )

  def handle_input(:args, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, response} <- call_api(state, message.message) do
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
      {:error, reason} ->
        send_error(state, reason)
        {:error, reason, state}
    end
  end

  defp call_api(state, args) do
    with {:ok, url} <- build_url(option(state, :url), args),
         {:ok, headers} <- build_headers(option(state, :headers), args),
         {:ok, response} <- request(option(state, :method), url, headers) do
      {:ok, response}
    else
      error -> error
    end
  end

  defp request(method, url, headers) do
    request =
      Req.new(
        method: method,
        url: url,
        headers: headers
      )

    case Req.request(request) do
      {:ok, %Req.Response{status: status, body: body}} ->
        {:ok, %{status: status, body: body}}

      {:error, %{reason: reason}} ->
        {:error, reason}
    end
  end

  defp build_url(url_template, args) do
    with {:ok, url} <- fill_url(url_template, args),
         {:ok, uri} <- URI.new(url),
         {:ok, _} <- validate_scheme(uri.scheme) do
      {:ok, url}
    end
  end

  defp fill_url(url, args) do
    {:ok,
     args
     |> Enum.reduce(url, fn
       {key, value}, acc when is_number(value) ->
         String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

       {key, value}, acc when is_binary(value) ->
         String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

       _, acc ->
         acc
     end)}
  end

  defp build_headers(headers_template, _args) do
    with {:ok, headers} <- Jason.decode(headers_template) do
      {:ok, headers}
    else
      {:error, reason} -> {:error, reason}
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
