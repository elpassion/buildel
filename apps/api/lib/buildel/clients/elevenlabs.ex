defmodule Buildel.Clients.ElevenlabsBehaviour do
  @callback synthesize(String.t(), String.t()) :: %HTTPoison.AsyncResponse{}
end

defmodule Buildel.Clients.Elevenlabs do
  alias Buildel.Clients.ElevenlabsBehaviour
  @behaviour ElevenlabsBehaviour

  use WebSockex

  @impl ElevenlabsBehaviour
  def synthesize(text, api_key \\ nil) do
    HTTPoison.post!(
      "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM/stream?optimize_streaming_latency=2",
      Jason.encode!(%{
        "text" => text,
        "model_id" => "eleven_monolingual_v1",
        "voice_settings" => %{"stability" => 0, "similarity_boost" => 0}
      }),
      [
        {"Content-Type", "application/json"},
        {"xi-api-key", api_key || System.get_env("ELEVENLABS_API_KEY")}
      ],
      stream_to: self()
    )
  end

  def speak!(token, state \\ %{}) do
    speak(state,
      extra_headers: ["xi-api-key": token, "content-type": "application/json"],
      debug: [:trace]
    )
  end

  @wss_url "wss://api.elevenlabs.io/v1/text-to-speech/cgSgspJ2msm6clMCkdW9/stream-input?model_id=eleven_turbo_v2_5&inactivity_timeout=180"
  def speak(state, opts \\ []) do
    WebSockex.start_link(@wss_url, __MODULE__, state, opts)
  end

  def generate_speech(pid, text) do
    # IO.inspect(text, label: "text: ")

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
    IO.inspect("Flushing", label: "Flushing: ")

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
