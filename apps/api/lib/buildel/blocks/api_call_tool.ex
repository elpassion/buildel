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
            "required" => ["method", "url"],
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
                }
              )
          })
      }
    }
  end

  def function(context_id, block_name) do
    Function.new!(%{
      name: "addition",
      description: "Adds two numbers",
      parameters_schema: %{
        type: "object",
        properties: %{
          left: %{
            type: "number",
            description: "Left number"
          },
          right: %{
            type: "number",
            description: "Right number"
          }
        },
        required: ["left", "right"]
      },
      function: fn args, _context ->
        pid = block_context().block_pid(context_id, block_name)

        call_api_sync(pid, args)
      end
    })
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
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    {:ok,
     state
     |> assign_stream_state(opts)}
  end

  @impl true
  def handle_call({:call_api, args}, _caller, state) do
    state = state |> send_stream_start()

    headers = [{"Accept", "application/json"}, {"Content-Type", "application/json"}]

    case HTTPoison.request(
           state[:opts][:method],
           state[:opts][:url],
           args |> Jason.encode!(),
           headers
         ) do
      {:ok, %{status_code: _status_code, body: body}} ->
        state = state |> schedule_stream_stop()
        {:reply, body, state}

      {:error, error} ->
        state = state |> schedule_stream_stop()
        {:reply, "Error: #{inspect(error)}", state}
    end
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  defp block_context() do
    Application.fetch_env!(:buildel, :block_context_resolver)
  end
end
