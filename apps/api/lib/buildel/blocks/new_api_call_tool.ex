defmodule Buildel.Blocks.NewApiCallTool do
  alias Buildel.Blocks.Fields.EditorField
  alias EditorField.Suggestion
  use Buildel.Blocks.NewBlock
  use Buildel.Blocks.NewBlock.HttpApi
  alias Buildel.FlattenMap

  defblock(:api_call_tool,
    description: "Tool used to call HTTP APIs.",
    groups: ["tools", "text"]
  )

  definput(:args, schema: %{})
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

  defoption(:description, %{
    type: "string",
    title: "Description",
    description:
      "The description of the API call.",
    default: "Tool to call HTTP APIs.",
    displayWhen: %{
      connections: %{
        tool_worker: %{
          min: 1
        }
      }
    },
    minLength: 1,
    readonly: true
  })

  defoption(
    :body,
    EditorField.new(%{
      title: "Body",
      description:
        "Valid JSONSchema definition of the body passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1
    })
  )

  defoption(
    :headers,
    EditorField.new(%{
      title: "Headers",
      description:
        "Valid JSONSchema definition of the headers passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1
    })
  )

  defoption(
    :params,
    EditorField.new(%{
      title: "Params",
      description:
        "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1
    })
  )

  defoption(
    :searchParams,
    EditorField.new(%{
      title: "Search Params",
      description:
        "Valid JSONSchema definition of the search params passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
      editorLanguage: "json",
      default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
      minLength: 1
    })
  )

  deftool(:request,
    description: "Make an API request.",
    schema: %{
      type: "object",
      properties: %{

      },
      required: []
    }
  )

  def handle_input(:args, %Message{type: :json, message: message_message} = message, state)
      when is_list(message_message) do
    send_stream_start(state, :output, message)

    %{state: state, responses: responses} =
      Enum.reduce(message_message, %{state: state, responses: []}, fn
        args, %{state: state, responses: responses} ->
          with {:ok, response} <- call_api(state, args) do
            responses = [%{status: "ok", response: response} | responses]
            %{state: state, responses: responses}
          else
            {:error, reason, state} ->
              responses = [%{status: "error", response: reason} | responses]
              %{state: state, responses: responses}
          end
      end)

    output(
      state,
      :output,
      message
      |> Message.from_message()
      |> Message.set_type(:json)
      |> Message.set_message(
        responses
        |> Enum.reverse()
      )
    )

    {:ok, state}
  end

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
        send_error(
          state,
          Message.from_message(message) |> Message.set_type(:text) |> Message.set_message(reason)
        )

        {:error, reason, state}
    end
  end


  def handle_tool_call(:request, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, response} <- call_api(state, args) do
      output(
        state,
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:json)
        |> Message.set_message(response)
      )

      {:ok, response, state}
    else
      {:error, reason} ->
        send_error(
          state,
          Message.from_message(message) |> Message.set_type(:text) |> Message.set_message(reason)
        )

        {:error, reason, state}
    end
  end

  def handle_get_tool(:request, state) do
    tool = @tools |> Enum.find(&(&1.name == :request))

    description = option(state, :description)
IO.inspect(merge_schemas(state), label: "merge_schemas")
    tool = tool |> Map.put(:description, description) |> Map.put(:schema, merge_schemas(state))
  end

  defp call_api(state, args) do
    with {:ok, params} <- build_params("{}", args),
         {:ok, searchParams} <- build_search_params("{}", args),
         {:ok, body} <- build_body("{}", args),
         {:ok, headers} <- build_headers("{}", args),
         {:ok, url} <- build_url(option(state, :url), %{params: params, body: body, headers: headers, searchParams: searchParams}),
         {:ok, response} <- request(option(state, :method), url, headers, body) do
      {:ok, response}
    else
      error -> error
    end
  end

  defp request(method, url, headers, body \\ %{} ) do
    request =
      Req.new(
        method: method,
        url: url,
        headers: headers,
        body: Jason.encode!(body)
      )

    case httpApi().request(request) do
      {:ok, %Req.Response{status: status, body: body}} ->
        {:ok, %{status: status, body: body}}

      {:error, %{reason: reason}} ->
        {:error, reason}
    end
  end

  defp build_url(url_template, args) do
    with {:ok, url} <- fill_url(url_template, FlattenMap.flatten(args)),
         {:ok, uri} <- URI.new(url),
         {:ok, _} <- validate_scheme(uri.scheme) do
      {:ok, url}
    end
  end

  defp fill_url(url, args) do
    {:ok,
     args
     |> Enum.reduce(url, fn
       {key, value}, acc when is_number(value) or is_binary(value) ->
         String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

       _, acc ->
         acc
     end)}
  end

  defp build_headers(headers_template, args) do
    with {:ok, args_headers} <- validate_args_headers(Map.get(args, "headers", %{})),
         {:ok, headers} <- Jason.decode(headers_template) do

      {:ok, headers |> Map.merge(args_headers)}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_params(params_template, args) do
    with {:ok, args_params} <- validate_args_params(Map.get(args, "params", %{})),
         {:ok, params} <- Jason.decode(params_template) do
      {:ok, params |> Map.merge(args_params)}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_search_params(params_template, args) do
    with {:ok, args_params} <- validate_args_search_params(Map.get(args, "searchParams", %{})),
         {:ok, params} <- Jason.decode(params_template) do
      {:ok, params |> Map.merge(args_params)}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp build_body(body_template, args) do
    with {:ok, args_body} <- validate_args_body(Map.get(args, "body", %{})),
         {:ok, body} <- Jason.decode(body_template) do

      {:ok, body |> Map.merge(args_body)}
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

  defp validate_args_headers(headers) when is_map(headers) do
    {:ok, headers}
  end

  defp validate_args_headers(_) do
    {:error, "Invalid headers"}
  end

  defp validate_args_body(body) when is_map(body) do
    {:ok, body}
  end

  defp validate_args_body(_) do
    {:error, "Invalid body"}
  end

  defp validate_args_params(params) when is_map(params) do
    {:ok, params}
  end

  defp validate_args_params(_) do
    {:error, "Invalid params"}
  end

  defp validate_args_search_params(params) when is_map(params) do
    {:ok, params}
  end

  defp validate_args_search_params(_) do
    {:error, "Invalid search params"}
  end

  defp merge_schemas(state) do
    properties = %{
      body: Jason.decode!(option(state, :body)),
      headers: Jason.decode!(option(state, :headers)),
      params: Jason.decode!(option(state, :params)),
      searchParams: Jason.decode!(option(state, :searchParams))
    }

    %{
      type: "object",
      properties: properties,
      required: determine_required(properties)
    }
  end

  defp determine_required(properties) do
    properties
    |> Enum.filter(fn {_key, value} ->
      contains_required?(value)
    end)
    |> Enum.map(fn {key, _value} -> to_string(key) end)
  end

  defp contains_required?(%{"required" => required_list}) when is_list(required_list) and length(required_list) > 0, do: true

  defp contains_required?(%{"properties" => properties}) when is_map(properties) do
    properties
    |> Enum.any?(fn {_key, value} -> contains_required?(value) end)
  end

  defp contains_required?(_), do: false
end
