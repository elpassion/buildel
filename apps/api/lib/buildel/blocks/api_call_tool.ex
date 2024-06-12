defmodule Buildel.Blocks.ApiCallTool do
  alias Buildel.Blocks.Fields.EditorField.Suggestion
  alias Buildel.Blocks.Fields.EditorField
  alias Buildel.Blocks.Utils.Injectable
  alias Buildel.FlattenMap
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  def options() do
    %{
      type: "api_call_tool",
      description: "Tool used to call HTTP APIs.",
      groups: ["text", "tools"],
      inputs: [Block.text_input("args")],
      outputs: [Block.text_output("response")],
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
                  "default" => "GET"
                },
                url: %{
                  "type" => "string",
                  "title" => "URL",
                  "description" =>
                    "The URL to send the request to. If you want to use a variable, use `{{variable_name}}`. Notice the double curly braces!",
                  "minLength" => 1
                },
                description: %{
                  "type" => "string",
                  "title" => "Description",
                  "description" => "The description of the API call.",
                  "minLength" => 1
                },
                parameters:
                  EditorField.new(%{
                    title: "Parameters",
                    description:
                      "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. i.e. `{\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}`.",
                    editorLanguage: "json",
                    default: "{\"type\": \"object\", \"properties\": {}, \"required\": []}",
                    minLength: 1
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
                    default: "{{config.block_name}} API 🖥️: {{config.args}}\n",
                    description: "How to format calling of api call through tool interface.",
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

  # Client

  def call_api(pid, args) do
    GenServer.cast(pid, {:call_api, args})
  end

  def call_api_sync(pid, args) do
    GenServer.call(pid, {:call_api, args}, :infinity)
  end

  def send_response(pid, response) do
    GenServer.cast(pid, {:response, response})
  end

  # Server

  @impl true
  def setup(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    context =
      block_context().context_from_context_id(context_id)
      |> Map.put("metadata", opts.metadata)

    flattened_metadata = FlattenMap.flatten(opts.metadata)

    {:ok,
     state
     |> Map.put(:parameters, Jason.decode!(opts.parameters))
     |> Map.put(:context, context)
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
  def handle_cast({:call_api, args}, state) do
    pid = self()
    state = state |> send_stream_start()

    Task.start(fn ->
      response = do_call_api(state, args)
      send_response(pid, {:text, response})
    end)

    {:noreply, state}
  end

  @impl true
  def handle_cast({:response, {:text, body}}, state) do
    %{"status" => status, "body" => body} = body |> Jason.decode!()

    body = Buildel.JQ.query!(body, state.jq_filter)

    message =
      %{status: status, body: body}
      |> Jason.encode!()

    Buildel.BlockPubSub.broadcast_to_io(
      state.context_id,
      state.block_name,
      "response",
      {:text, message}
    )

    state = state |> schedule_stream_stop()
    {:noreply, state}
  end

  @impl true
  def handle_call({:call_api, args}, _caller, state) do
    state = state |> send_stream_start()
    response = do_call_api(state, args)
    state = state |> schedule_stream_stop()
    {:reply, response, state}
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    function =
      Function.new!(%{
        name: state.block.name,
        description: state[:opts].description,
        parameters_schema: state[:parameters],
        function: fn args, _context ->
          call_api_sync(pid, args)
        end
      })

    {:reply,
     %{
       function: function,
       call_formatter: fn props ->
         args = %{"config.args" => props, "config.block_name" => state.block.name}
         build_call_formatter(state.block.opts.call_formatter, args)
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
  end

  @impl true
  def handle_input("args", {_topic, :text, message, _metadata}, state) do
    case Jason.decode(message) do
      {:ok, decoded} ->
        call_api(self(), decoded)
        state

      {:error, _} ->
        send_error(state, "Invalid JSON message received.")
        state
    end
  end

  defp do_call_api(state, args) do
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
        "#{Jason.encode!(state.context)}::#{payload}"
      )

    headers =
      headers ++
        [
          "X-Buildel-Topic": topic,
          "X-Buildel-Context": Jason.encode!(state.context)
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
        Jason.encode!(%{status: status_code, body: body})

      {:error, %{reason: reason}} ->
        "Error: #{reason}"
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
