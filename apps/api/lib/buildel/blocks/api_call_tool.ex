defmodule Buildel.Blocks.ApiCallTool do
  use Buildel.Blocks.Block
  alias LangChain.Function

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :call_api

  @impl true
  def options() do
    %{
      type: "api_call_tool",
      description: "Enables the configuration and execution of HTTP requests.",
      groups: ["text", "tools"],
      inputs: [],
      outputs: [],
      ios: [Block.io("tool", "worker")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["method", "url", "name", "description", "parameters"],
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
                  "description" => "The URL to send the request to."
                },
                name: %{
                  "type" => "string",
                  "title" => "Name",
                  "description" => "The name of the API call."
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
                    "Valid JSONSchema definition of the parameters passed to api call.",
                  "presentAs" => "editor",
                  "editorLanguage" => "json"
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

  def call_api(_pid, _text) do
    :ok
  end

  def call_api_sync(pid, args) do
    GenServer.call(pid, {:call_api, args})
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
     |> Map.put(:parameters, Jason.decode!(opts.parameters))
     |> Map.put(:context, context)
     |> assign_stream_state(opts)}
  end

  @impl true
  def handle_call({:call_api, args}, _caller, state) do
    state = state |> send_stream_start()

    url =
      args
      |> Enum.reduce(state[:opts][:url], fn
        {key, value}, acc when is_binary(value) ->
          String.replace(acc, "{{#{key}}}", value |> to_string())

        _, acc ->
          acc
      end)

    payload = args |> Jason.encode!()

    topic =
      Buildel.BlockPubSub.io_topic(
        state[:context_id],
        state[:block_name],
        "output"
      )

    {:ok, token} =
      block_context().create_run_auth_token(
        state[:context_id],
        "#{state[:context] |> Jason.encode!()}::#{payload}"
      )

    headers = [
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Buildel-Topic": topic,
      "X-Buildel-Context": state[:context] |> Jason.encode!()
    ]

    headers =
      if state[:opts][:authorize] do
        headers ++
          [
            Authorization: "Bearer gC3spiRVxxLUIjqFhJrvYwSWyOQyRAb0xTqMwesJ2Y0="
          ]
      else
        headers
      end

    case HTTPoison.request(
           state[:opts][:method],
           url,
           payload,
           headers
         )
         |> IO.inspect() do
      {:ok, %{status_code: _status_code, body: body}} ->
        state = state |> schedule_stream_stop()
        {:reply, body, state}

      {:error, error} ->
        state = state |> schedule_stream_stop()
        {:reply, "Error: #{inspect(error)}", state}
    end
  end

  @impl true
  def handle_call({:function, _}, _from, state) do
    pid = self()

    function =
      Function.new!(%{
        name: state[:opts].name,
        description: state[:opts].description,
        parameters_schema: state[:parameters],
        function: fn args, _context ->
          call_api_sync(pid, args)
        end
      })

    {:reply, function, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
