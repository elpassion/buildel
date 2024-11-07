defmodule Buildel.Blocks.ApiCallTool do
  alias Buildel.Blocks.Fields.EditorField.Suggestion
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Blocks.Utils.Injectable
  alias Buildel.FlattenMap
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool
  # Config

  @impl true
  def options() do
    %{
      type: "api_call_tool",
      description: "Tool used to call HTTP APIs.",
      groups: ["tools", "text"],
      inputs: [Block.text_input("args")],
      outputs: [Block.text_output("response")],
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
        "opts" =>
          options_schema(%{
            "required" => ["method", "url", "description", "parameters", "headers"],
            "properties" =>
              Jason.OrderedObject.new(
                method: %{
                  "type" => "string",
                  "title" => "Method",
                  "description" => "The HTTP method to use for the request.",
                  "enum" => ["GET", "POST", "PUT", "PATCH", "DELETE"],
                  "enumPresentAs" => "radio",
                  "default" => "GET",
                  "readonly" => true
                },
                url: %{
                  "type" => "string",
                  "title" => "URL",
                  "description" =>
                    "The URL to send the request to. If you want to use a variable, use `{{variable_name}}`. Notice the double curly braces!",
                  "minLength" => 1,
                  "readonly" => true
                },
                description: %{
                  "type" => "string",
                  "title" => "Description",
                  "description" => "The description of the API call.",
                  "minLength" => 1,
                  "default" => "Tool to call HTTP APIs.",
                  "displayWhen" => %{
                    connections: %{
                      tool_worker: %{
                        min: 1
                      }
                    }
                  },
                },
                parameters:
                  EditorField.new(%{
                    title: "Parameters",
                    description:
                      "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
                    editorLanguage: "json",
                    default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
                    minLength: 1,
                    readonly: true
                  }),
                headers:
                  EditorField.new(%{
                    title: "Headers",
                    description:
                      "Valid JSON object of the headers to be sent with the request. i.e. `{\"Content-Type\": \"application/json\"}`.",
                    editorLanguage: "json",
                    default:
                      "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}",
                    minLength: 1,
                    suggestions: [
                      Suggestion.inputs(),
                      Suggestion.metadata(),
                      Suggestion.secrets()
                    ]
                  }),
                call_formatter:
                  EditorField.call_formatter(%{
                    default: """
                    <details>
                      <summary>API Request</summary>
                      "{{config.args}}"
                    </details>
                    """,
                    description: "How to format calling of api call through tool interface.",
                    displayWhen: %{
                      connections: %{
                        tool_worker: %{
                          min: 1
                        }
                      }
                    },
                    minLength: 1
                  }),
                authorize: %{
                  "type" => "boolean",
                  "title" => "Authorize",
                  "description" => "Whether to authorize the request with organization secret.",
                  "default" => false
                },
                jq_filter:
                  EditorField.new(%{
                    title: "JQ Filter",
                    description: "JQ filter to apply to the response.",
                    editorLanguage: "json",
                    default: ".",
                    minLength: 1
                  })
              )
          })
      }
    }
  end

  @impl true
  def setup(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    context =
      block_context().context_from_context_id(context_id)
      |> Map.put("metadata", opts.metadata)

    flattened_metadata = FlattenMap.flatten(opts.metadata)

    {:ok,
     state
     |> Map.put(:parameters, Jason.decode!(opts.parameters))
     |> Map.put(:api_context, context)
     |> Map.put(
       :available_metadata,
       Injectable.used_metadata_keys([opts.url, opts.headers, opts.call_formatter])
       |> Enum.reduce(%{}, fn key, acc ->
         acc
         |> Map.put(key, flattened_metadata[key])
       end)
     )
     |> Map.put(
       :available_secrets,
       Injectable.used_secrets_keys([opts.url, opts.headers, opts.call_formatter])
       |> Enum.reduce(%{}, fn secret, acc ->
         acc
         |> Map.put(secret, block_context().get_secret_from_context(state.context_id, secret))
       end)
     )
     |> Map.put(:jq_filter, opts[:jq_filter] || ".")}
  end

  @impl true
  def tools(state) do
    [
      %{
        function: %{
          name: "request",
          description: state[:opts].description,
          parameters_schema: state[:parameters]
        },
        call_formatter: fn props ->
          args = %{"config.args" => props, "config.block_name" => state.block.name}
          build_call_formatter(state.block.opts.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  @impl true
  def handle_input("args", {_topic, :text, message, _metadata}, state) do
    send_stream_start(state, "response")

    case Jason.decode(message) do
      {:ok, args} ->
        response = call_api(state, args)
        output(state, "response", {:text, response |> Jason.encode!()})

      {:error, _} ->
        send_error(state, "Invalid JSON message received.")
        send_stream_stop(state, "response")
        state
    end
  end

  @impl true
  def handle_tool(
        "tool",
        "request",
        {_topic, :text, args, _},
        state
      ) do
    state = send_stream_start(state)
    response = call_api(state, args) |> Jason.encode!()
    state = output(state, "response", {:text, response})
    {response, state}
  end

  defp call_api(state, args) do
    payload = args |> Jason.encode!()

    args =
      args
      |> Map.put(:metadata, state.available_metadata)
      |> Map.put(:secrets, state.available_secrets)
      |> FlattenMap.flatten()

    url = build_url(state.opts.url, args)
    headers = build_headers(state.opts.headers, args)

    topic = Buildel.BlockPubSub.io_topic(state.context_id, state.block_name, "output")

    {:ok, token} =
      block_context().create_run_auth_token(
        state.context_id,
        "#{Jason.encode!(state.api_context)}::#{payload}"
      )

    headers =
      headers ++
        [
          "X-Buildel-Topic": topic,
          "X-Buildel-Context": Jason.encode!(state.api_context)
        ]

    headers =
      if state[:opts][:authorize] do
        headers ++
          [
            Authorization: "Bearer #{token}"
          ]
      else
        headers
      end

    case HTTPoison.request(
           state[:opts][:method],
           url,
           payload,
           headers
         ) do
      {:ok, %{status_code: status_code, body: body}} ->
        body = Buildel.JQ.query!(body, state.jq_filter)
        %{status: status_code, body: body}

      {:error, %{reason: reason}} ->
        %{status: 500, body: "Error: #{reason}"}
    end
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

  defp build_url(url, args) do
    args
    |> Enum.reduce(url, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      _, acc ->
        acc
    end)
  end

  defp build_headers(headers_string, args) do
    args
    |> Enum.reduce(headers_string, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string())

      _, acc ->
        acc
    end)
    |> Jason.decode!()
    |> Enum.to_list()
  end
end
