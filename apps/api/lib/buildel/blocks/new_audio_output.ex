defmodule Buildel.Blocks.NewAudioOutput do
  use Buildel.Blocks.NewBlock

  defblock(:audio_output,
    description:
      "It's designed to work seamlessly with other audio-related blocks in Buildel, ensuring smooth and flexible audio output capabilities in applications.",
    groups: ["audio", "inputs / outputs"]
  )

  definput(:input, schema: %{}, type: :audio)

  defoutput(:output, schema: %{}, type: :audio, public: true)

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message |> Message.from_message())

    {:ok, state}
  end
end
