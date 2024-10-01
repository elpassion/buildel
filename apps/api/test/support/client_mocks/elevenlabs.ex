defmodule Buildel.ClientMocks.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  @impl ElevenlabsBehaviour
  def speak!(_api_key, state) do
    {:ok, state.stream_to} |> IO.inspect()
  end

  @impl ElevenlabsBehaviour
  def generate_speech(pid, _text) do
    IO.inspect("Generating speech")

    send(
      pid,
      {:audio_chunk, File.read!("test/support/fixtures/real.mp3")} |> IO.inspect()
    )

    :ok
  end
end
