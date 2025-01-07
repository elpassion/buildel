defmodule Buildel.Blocks.NewCollectAllAudio do
  require Logger
  use Buildel.Blocks.NewBlock

  defblock(:collect_all_audio,
    description: "This module specializes in accumulating and consolidating audio input from streaming sources.",
    groups: ["audio", "utils"]
  )

  definput(:input, schema: %{}, type: :audio)

  defoutput(:output, schema: %{}, type: :audio)

  def setup(state) do
    {:ok, state |> Map.put(:audio, <<>>)}
  end

  defp save_audio_chunk(audio_chunk, state) do
    audio = state[:audio] <> audio_chunk
    state |> Map.put(:audio, audio)
  end

  def handle_input(:input, %Message{message: chunk} = message, state) do
    send_stream_start(state, :output, message)

    state = save_audio_chunk(chunk, state)

    {:ok, state}
  end

  def handle_input_stream_stop(_name, %Message{} = message, state) do
    state = drain_audio(state, message)

    {:ok, state}
  end

  defp drain_audio(state, message) do
    if state[:audio] == <<>> && !state[:draining_again] do
      drain_again(state, message)
    else
      audio = state[:audio]

      output(state, :output, message |> Message.from_message() |> Message.set_message(audio) |> Message.set_type(:audio_binary))

      state
      |> Map.put(:audio, <<>>)
      |> Map.put(:draining_again, false)
    end
  end

  defp drain_again(state, message) do
    state
    |> Map.put(:draining_again, true)
    |> drain_audio(message)
  end
end
