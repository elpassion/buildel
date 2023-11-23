defmodule Buildel.Clients.DeepgramBehaviour do
  @callback connect!(String.t(), %{stream_to: pid}) :: {:ok, pid} | {:error, term}
  @callback disconnect(pid) :: :ok
  @callback transcribe_audio(pid, {:binary, binary}) :: :ok
  @callback transcribe(String.t(), {:binary, binary}) :: :ok
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

  @http_url "https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&diarize=true&model=general"
  def transcribe(token \\ nil, file, opts \\ %{language: "en", timeout: 10000}) do
    %{language: lang, timeout: timeout} = opts

    url = build_url(@http_url, [{:language, lang}])

    headers = [
      {"Authorization", "Token #{token || System.get_env("DEEPGRAM_API_KEY")}"}
    ]

    options = [timeout: timeout, recv_timeout: timeout]

    HTTPoison.post!(url, file, headers, options)
    |> handle_response
  end

  def handle_response(response) do
    result = Jason.decode!(response.body)
    send(self(), {:raw_transcript, result})

    channels = result |> get_in(["results", "channels"])

    transcript =
      Enum.map(channels, fn %{"alternatives" => alternatives} ->
        alternatives
        |> List.first()
        |> Map.get("transcript")
      end)
      |> Enum.join("")

    if transcript, do: send(self(), {:transcript, %{message: transcript, is_final: true}})

    {:ok}
  end

  @wss_url "wss://api.deepgram.com/v1/listen?model=general&smart_format=true&punctuate=true&diarize=true"
  def start_link(state \\ %{language: "en"}, opts \\ []) do
    %{language: lang} = state

    url = build_url(@wss_url, [{:language, lang}])

    WebSockex.start_link(url, __MODULE__, state, opts)
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

  defp build_url(url, opts \\ []) do
    query = Enum.map(opts, fn {key, value} -> "#{key}=#{URI.encode(value)}" end) |> Enum.join("&")

    if query !== "" do
      "#{url}&#{query}"
    else
      url
    end
  end
end
