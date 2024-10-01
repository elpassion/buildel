defmodule Buildel.ClientMocks.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  def init(state) do
    {:ok, state}
  end

  @impl ElevenlabsBehaviour
  def speak!(_api_key, state) do
    GenServer.start_link(__MODULE__, state, []) |> IO.inspect(label: "speak!")
  end

  @impl ElevenlabsBehaviour
  def generate_speech(pid, _text) do
    IO.inspect("GENERATE_SPEECH")
    IO.inspect(pid, label: "pid in generate_speech")

    GenServer.cast(
      pid,
      {:audio_chunk, File.read!("test/support/fixtures/real.mp3")}
    )

    :ok
  end

  def disconnect(pid) do
    GenServer.stop(pid)
  end

  def handle_cast({:audio_chunk, chunk}, state) do
    IO.inspect("CAST")

    IO.inspect(state.stream_to, label: "stream_to in handle_cast")

    send(
      state.stream_to,
      {:audio_chunk, chunk}
    )
    |> IO.inspect()

    {:noreply, state}
  end
end
