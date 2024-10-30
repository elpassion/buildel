defmodule Buildel.Blocks.Timer do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "timer",
      description: "Used to emit a message after a specified time period.",
      groups: ["utils"],
      inputs: [
        Block.text_input("start"),
        Block.text_input("stop"),
        Block.audio_input("stop_audio")
      ],
      outputs: [Block.text_output("on_stop")],
      ios: [],
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

  @impl true
  def setup(%{type: __MODULE__} = state) do
    {:ok, state |> Map.put(:timer, nil)}
  end

  defp start(state, text) do
    if state.timer, do: Process.cancel_timer(state.timer)
    state = send_stream_start(state, "on_stop")
    timer = Process.send_after(self(), {:stop}, state.opts.time)
    Map.put(state, :timer, timer) |> Map.put(:text, text)
  end

  defp stop_timer(state) do
    if state.timer, do: Process.cancel_timer(state.timer)
    Map.put(state, :timer, nil)
    send_stream_stop(state, "on_stop")
  end

  @impl true
  def handle_input("start", {_name, :text, text, _metadata}, state) do
    start(state, text)
  end

  @impl true
  def handle_input("stop", {_name, :text, _text, _metadata}, state) do
    stop_timer(state)
  end

  @impl true
  def handle_input("stop_audio", {_name, _, _text, _metadata}, state) do
    stop_timer(state)
  end

  @impl true
  def handle_info({:stop}, state) do
    state = state |> Map.put(:timer, nil)

    BlockPubSub.broadcast_to_io(
      state.context_id,
      state.block_name,
      "on_stop",
      {:text, state |> Map.get(:text)}
    )

    state = send_stream_stop(state, "on_stop")
    {:noreply, state}
  end
end
