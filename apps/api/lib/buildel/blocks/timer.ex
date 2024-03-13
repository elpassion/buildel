defmodule Buildel.Blocks.Timer do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :start

  @impl true
  def options() do
    %{
      type: "timer",
      description: "Used to emit a message after a specified time period.",
      groups: ["utils"],
      inputs: [Block.text_input("start")],
      outputs: [Block.text_output("on_stop")],
      ios: [],
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
            "required" => ["time"],
            "properties" => %{
              time: %{
                "type" => "number",
                "title" => "Time (ms)",
                "description" => "Time in milliseconds after which the message will be emitted.",
                "default" => 60_000,
                "minimum" => 0,
                "step" => 1
              }
            }
          })
      }
    }
  end

  # Client

  def start(pid, {:text, _text}) do
    GenServer.cast(pid, {:start})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, state |> assign_stream_state |> Map.put(:timer, nil)}
  end

  @impl true
  def handle_cast({:start}, state) do
    if state.timer, do: Process.cancel_timer(state.timer)
    state = send_stream_start(state, "on_stop")
    timer = Process.send_after(self(), {:stop}, state.opts.time)
    state = Map.put(state, :timer, timer)
    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end

  @impl true
  def handle_info({:stop}, state) do
    state = state |> Map.put(:timer, nil)
    BlockPubSub.broadcast_to_io(state.context_id, state.block_name, "on_stop", {:text, "0"})
    state = send_stream_stop(state, "on_stop")
    {:noreply, state}
  end
end
