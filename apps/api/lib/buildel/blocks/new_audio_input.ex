defmodule Buildel.Blocks.NewAudioInput do
  use Buildel.Blocks.NewBlock

  defblock(:audio_input,
    description:
      "A specialized block designed for capturing and streaming audio data.",
    groups: ["audio", "inputs / outputs"]
  )

  definput(:input, schema: %{}, type: :audio, public: true)

  definput(:mute, schema: %{})

  definput(:unmute, schema: %{})

  defoutput(:output, schema: %{}, type: :audio)

  defoutput(:status, schema: %{}, public: true, visible: false)


  def handle_input(:input, %Message{type: :audio_binary} = message, state) do
    if(state[:mute]) do
    else
      output(state, :output, message |> Message.from_message())
    end

    {:ok, state}
  end

  def handle_input(:mute, %Message{} = message, state) do
    state = state |> Map.put(:mute, true)

    output(state, :status, message |> Message.from_message() |> Message.set_message("muted") |> Message.set_type(:text))

    {:ok, state}
  end

  def handle_input(:unmute, %Message{} = message, state) do
    state = state |> Map.put(:mute, false)

    output(state, :status, message |> Message.from_message() |> Message.set_message("unmuted") |> Message.set_type(:text))

    {:ok, state}
  end
end
