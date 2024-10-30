defmodule Buildel.Clients.ElevenlabsBehaviour do
  @callback speak!(String.t(), %{stream_to: pid}) :: {:ok, pid} | {:error, term}
  @callback generate_speech(pid, String.t()) :: :ok
end

defmodule Buildel.Clients.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  use WebSockex

  @impl ElevenlabsBehaviour
  def speak!(api_key, state \\ %{}) do
    speak(state,
      extra_headers: ["xi-api-key": api_key, "content-type": "application/json"],
      debug: [:trace]
    )
  end

  @wss_url "wss://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9/stream-input?model_id=eleven_turbo_v2_5&inactivity_timeout=180"
  def speak(state, opts \\ []) do
    WebSockex.start_link(@wss_url, __MODULE__, state, opts)
  end

  @impl ElevenlabsBehaviour
  def generate_speech(pid, text) do
    WebSockex.send_frame(
      pid,
      {:text,
       Jason.encode!(%{
         text: " "
       })}
    )

    WebSockex.send_frame(
      pid,
      {:text,
       Jason.encode!(%{
         text: text <> " "
       })}
    )
  end

  def flush(pid) do
    WebSockex.send_frame(pid, {:text, Jason.encode!(%{text: " ", flush: true})})
  end

  @impl true
  def handle_frame({:text, text}, state) do
    message = Jason.decode!(text)

    case message do
      %{"error" => _, "code" => 1008} ->
        send(state.stream_to, {:reconnect})

      %{"audio" => nil} ->
        nil

      %{"audio" => audio} ->
        send(state.stream_to, {:audio_chunk, Base.decode64!(audio)})
    end

    {:ok, state}
  end

  def disconnect(pid) do
    GenServer.stop(pid)
  end
end
