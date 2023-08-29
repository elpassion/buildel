defmodule Buildel.ClientMocks.Deepgram do
  alias Buildel.Clients.DeepgramBehaviour
  @behaviour DeepgramBehaviour

  @impl DeepgramBehaviour
  def connect!(_token, state \\ %{}) do
    {:ok, pid} = GenServer.start_link(__MODULE__, state, [])
    pid
  end

  @impl DeepgramBehaviour
  def disconnect(pid) do
    GenServer.stop(pid)
  end

  @impl DeepgramBehaviour
  def transcribe_audio(pid, audio) do
    GenServer.cast(pid, {:transcribe_audio, audio})
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
