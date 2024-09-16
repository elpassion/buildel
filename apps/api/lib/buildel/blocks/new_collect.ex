defmodule Buildel.Blocks.NewCollect do
  use Buildel.Blocks.NewBlock

  defblock(:collect_all_text,
    description:
      "This module specializes in accumulating and consolidating text input from streaming sources.",
    groups: ["utils"]
  )

  definput(:input, schema: %{})
  defoutput(:output, schema: %{})

  def handle_input(:input, %Message{type: :text, message: message}, state) do
    send_stream_start(state, :output)

    state =
      state
      |> Map.update(:acc, "", fn acc -> acc <> message end)

    {:ok, state}
  end

  def handle_input_stream_stop(:input, state) do
    output(state, :output, Message.new(:text, state.acc))
    send_stream_stop(state, :output)
    state = state |> Map.put(:acc, "")
    {:ok, state}
  end
end
