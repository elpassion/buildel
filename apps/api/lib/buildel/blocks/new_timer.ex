defmodule Buildel.Blocks.NewTimer do
  use Buildel.Blocks.NewBlock

  defblock(:timer,
    description: "Used to emit a message after a specified time period.",
    groups: ["utils"]
  )

  definput(:start, schema: %{})
  definput(:stop, schema: %{})
  definput(:stop_audio, schema: %{}, type: :audio)

  defoutput(:on_stop, schema: %{})

  defoption(
    :time,
    %{
      "type" => "number",
      "title" => "Time (ms)",
      "description" => "Time in milliseconds after which the message will be emitted.",
      "default" => 60_000,
      "minimum" => 0,
      "step" => 1
    }
  )

  def setup(state) do
    {:ok, state |> Map.put(:timer, nil) |> Map.put(:message, nil)}
  end

  def handle_input(:start, %Message{} = message, state) do
    state = start(state, message)

    {:ok, state}
  end

  def handle_input(:stop, %Message{}, state) do
    state = stop_timer(state)
    {:ok, state}
  end

  def handle_input(:stop_audio, %Message{}, state) do
    state = stop_timer(state)
    {:ok, state}
  end

  defp start(state, message) do
    if state.timer do
      Process.cancel_timer(state.timer)
      send_stream_stop(state, :on_stop, state.message)
    end

    send_stream_start(state, :on_stop, message)
    timer = Process.send_after(self(), {:stop}, option(state, :time))
    Map.put(state, :timer, timer) |> Map.put(:message, message)
  end

  defp stop_timer(state) do
    if state.timer do
      Process.cancel_timer(state.timer)
      state = state |> Map.put(:timer, nil) |> Map.put(:message, nil)
      send_stream_stop(state, :on_stop, state.message)
      state
    else
      state
    end
  end

  @impl true
  def handle_info({:stop}, state) do
    output(state, :on_stop, state.message)
    state = state |> Map.put(:timer, nil) |> Map.put(:message, nil)

    {:noreply, state}
  end
end
