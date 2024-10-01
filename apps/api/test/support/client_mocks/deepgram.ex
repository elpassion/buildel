defmodule Buildel.ClientMocks.Deepgram do
  alias Buildel.Clients.DeepgramBehaviour
  @behaviour DeepgramBehaviour

  @impl DeepgramBehaviour
  def disconnect(pid) do
    GenServer.stop(pid)
  end

  @impl DeepgramBehaviour
  def transcribe_audio(pid, audio) do
    GenServer.cast(pid, {:transcribe_audio, audio})
  end

  @impl DeepgramBehaviour
  def transcribe_file(_token, _file, _opts) do
    send(
      self(),
      {:transcript, %{message: "Hello", is_final: true}}
    )
  end

  @impl DeepgramBehaviour
  def listen!(_, state) do
    GenServer.start_link(__MODULE__, state, [])
  end

  def init(state) do
    {:ok, state}
  end

  def handle_cast({:transcribe_audio, _}, state) do
    send(
      state.stream_to,
      {:transcript, %{message: "Hello", is_final: true}}
    )

    {:noreply, state}
  end
end
