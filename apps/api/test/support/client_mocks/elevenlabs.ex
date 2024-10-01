defmodule Buildel.ClientMocks.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  @impl ElevenlabsBehaviour
  def speak!(_api_key, state) do
    {:ok, state.stream_to}
  end

  @impl ElevenlabsBehaviour
  def generate_speech(pid, _text) do
    send(
      pid,
      {:audio_chunk, File.read!("test/support/fixtures/real.mp3")}
    )

    :ok
  end
end
