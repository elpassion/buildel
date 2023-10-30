defmodule Buildel.Clients.DeepgramBehaviour do
  @callback connect!(String.t(), %{stream_to: pid}) :: {:ok, pid} | {:error, term}
  @callback disconnect(pid) :: :ok
  @callback transcribe_audio(pid, {:binary, binary}) :: :ok
end

defmodule Buildel.Clients.Deepgram do
  alias Buildel.Clients.DeepgramBehaviour
  @behaviour Buildel.Clients.DeepgramBehaviour

  use WebSockex

  @impl DeepgramBehaviour
  def connect!(token, state \\ %{}) do
    start_link(state, extra_headers: [{"Authorization", "token #{token}"}], debug: [:trace])
  end

  @impl DeepgramBehaviour
  def disconnect(pid) do
    GenServer.stop(pid)
  end

  @impl DeepgramBehaviour
  def transcribe_audio(pid, {:binary, audio}) do
    WebSockex.send_frame(pid, {:binary, audio})
  end

  @url "wss://api.deepgram.com/v1/listen?model=general&smart_format=true&punctuate=true&language=en&diarize=true"
  def start_link(state \\ %{}, opts \\ []) do
    WebSockex.start_link(@url, __MODULE__, state, opts)
  end

  @impl true
  def handle_frame({:text, text}, state) do
    message = Jason.decode!(text)
    send(state.stream_to, {:raw_transcript, message})
    alternatives = message |> get_in(["channel", "alternatives"])
    is_final = message |> get_in(["is_final"])

    message =
      case alternatives do
        [first_alternative | _] -> first_alternative |> get_in(["transcript"])
        _ -> nil
      end

    if message, do: send(state.stream_to, {:transcript, %{message: message, is_final: is_final}})

    {:ok, state}
  end

  @impl true
  def handle_disconnect(_connection_status_map, state) do
    {:reconnect, state}
  end
end
