defmodule Buildel.Blocks.MemorySearchTool do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :query
  defdelegate io(name, role), to: Block

  @impl true
  def options() do
    %{
      type: "memory_search_tool",
      groups: ["text", "tools"],
      inputs: [],
      outputs: [],
      ios: [io("tool", "worker")],
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
            "required" => ["knowledge"],
            "properties" => %{
              "knowledge" => memory_schema(%{"default" => ""})
            }
          })
      }
    }
  end

  def tool_schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" => options_schema()
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
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

    {:ok, state |> assign_stream_state(opts)}
  end

  @impl true
  def handle_cast({:query, {:text, _query}}, state) do
    state = state |> send_stream_start()

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})
    {:noreply, state}
  end
end
