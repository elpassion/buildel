defmodule Buildel.ClientMocks.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  @impl ElevenlabsBehaviour
  def speak!(_api_key, _state) do
    {:ok, self()}
  end

  @impl ElevenlabsBehaviour
  def generate_speech(_pid, _text) do
    send(
      self(),
      {:audio_chunk, File.read!("test/support/fixtures/real.mp3")}
    )

    :ok
  end

  def disconnect(_pid) do
    :ok
  end

  def flush(_pid) do
    :ok
  end
end
