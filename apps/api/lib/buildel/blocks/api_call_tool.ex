defmodule Buildel.Blocks.ApiCallTool do
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, text), to: __MODULE__, as: :call_api

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
                    "The URL to send the request to. If you want to use a variable, use {{variable_name}}. Notice the double curly braces!"
                },
                description: %{
                  "type" => "string",
                  "title" => "Description",
                  "description" => "The description of the API call."
                },
                parameters: %{
                  "type" => "string",
                  "title" => "Parameters",
                  "description" =>
                    "Valid JSONSchema definition of the parameters passed to api call. Always pass a JSON object schema. ie. {\"type\": \"object\", \"properties\": {\"name\": {\"type\": \"string\"}}, \"required\": [\"name\"]}.",
                  "presentAs" => "editor",
                  "editorLanguage" => "json",
                  "default" => "{\"type\": \"object\", \"properties\": {}, \"required\": []}"
                },
                headers: %{
                  "type" => "string",
                  "title" => "Headers",
                  "description" =>
                    "Valid JSON object of the headers to be sent with the request. ie. {\"Content-Type\": \"application/json\"}.",
                  "presentAs" => "editor",
                  "editorLanguage" => "json",
                  "default" =>
                    "{\"Content-Type\": \"application/json\", \"Accept\": \"application/json\"}"
                },
                authorize: %{
                  "type" => "boolean",
                  "title" => "Authorize",
                  "description" => "Whether to authorize the request with organization secret.",
                  "default" => false
                }
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
  def init(
        %{context_id: context_id, type: __MODULE__, opts: opts, connections: connections} = state
      ) do
    subscribe_to_connections(context_id, connections)

    context =
      block_context().context_from_context_id(context_id)
      |> Map.put("metadata", opts.metadata)

    {:ok,
     state
     |> Map.put(:headers, Jason.decode!(opts.headers || "{}") |> Map.to_list())
     |> Map.put(:parameters, Jason.decode!(opts.parameters))
     |> Map.put(:context, context)
     |> assign_stream_state(opts)}
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
  def handle_cast({:response, response}, state) do
    Buildel.BlockPubSub.broadcast_to_io(
      state.context_id,
      state.block_name,
      "response",
      response
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
       call_formatter: fn args ->
         "#{state.block.name} API 🖥️: #{Jason.encode!(args)}\n"
       end,
       response_formatter: fn _response ->
         ""
       end
     }, state}
  end

  @impl true
  def handle_info({_name, :text, message}, state) do
    case Jason.decode(message) do
      {:ok, decoded} ->
        cast(self(), decoded)
        {:noreply, state}

      {:error, _} ->
        send_error(state, "Invalid JSON message received.")
        {:noreply, state}
    end
  end

  defp do_call_api(state, args) do
    url = build_url(state.opts.url, args)

    payload = args |> Jason.encode!()

    topic = Buildel.BlockPubSub.io_topic(state.context_id, state.block_name, "output")

    {:ok, token} =
      block_context().create_run_auth_token(
        state.context_id,
        "#{Jason.encode!(state.context)}::#{payload}"
      )

    headers =
      [
        "X-Buildel-Topic": topic,
        "X-Buildel-Context": Jason.encode!(state.context)
      ] ++ state[:headers]

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
end
