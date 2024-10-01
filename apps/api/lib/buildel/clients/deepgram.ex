defmodule Buildel.Clients.DeepgramBehaviour do
  @callback listen!(String.t(), %{stream_to: pid}) :: {:ok, pid} | {:error, term}
  @callback disconnect(pid) :: :ok
  @callback transcribe_audio(pid, {:binary, binary}) :: :ok
  @callback transcribe_file(String.t(), any(), map()) :: :ok
end

defmodule Buildel.Clients.Deepgram do
  alias Buildel.Clients.DeepgramBehaviour
  @behaviour Buildel.Clients.DeepgramBehaviour

  use Buildel.Clients.Utils.Srt
  use WebSockex

  @impl DeepgramBehaviour
  def listen!(token, state \\ %{}) do
    listen(state, extra_headers: [{"Authorization", "token #{token}"}], debug: [:trace])
  end

  @impl DeepgramBehaviour
  def disconnect(pid) do
    GenServer.stop(pid)
  end

  @impl DeepgramBehaviour
  def transcribe_audio(pid, {:binary, audio}) do
    WebSockex.send_frame(pid, {:binary, audio})
  end

  def keep_alive(pid) do
    WebSockex.send_frame(pid, {:text, Jason.encode!(%{type: "KeepAlive"})})
  end

  def flush(pid) do
    WebSockex.send_frame(pid, {:text, Jason.encode!(%{type: "Flush"})})
  end

  @wss_url "wss://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&diarize=true"
  def listen(state \\ %{language: "en", model: "base"}, opts \\ []) do
    %{language: lang, model: model} = state

    url = build_url(@wss_url, [{:language, lang}, {:model, model}])

    WebSockex.start_link(url, __MODULE__, state, opts)
  end

  def handle_frame({:binary, binary}, state) do
    send(state.stream_to, {:audio, binary})

    {:ok, state}
  end

  @impl true
  def handle_frame({:text, text}, state) do
    message = Jason.decode!(text)
    send(state.stream_to, {:raw_transcript, message})

    alternatives = message |> get_in(["channel", "alternatives"])
    is_final = message |> get_in(["is_final"])
    # speech_final = message |> get_in(["speech_final"])

    is_final = is_final

    if is_final, do: send(state.stream_to, {:end})

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

  @impl true
  @http_url "https://api.deepgram.com/v1/listen?smart_format=true&punctuate=true&diarize=true"
  def transcribe_file(
        token \\ nil,
        file,
        opts \\ %{language: "en", timeout: 10000, model: "base"}
      ) do
    %{language: lang, timeout: timeout, model: model} = opts

    url = build_url(@http_url, [{:language, lang}, {:model, model}])

    headers = [
      {"Authorization", "Token #{token || System.get_env("DEEPGRAM_API_KEY")}"}
    ]

    options = [timeout: timeout, recv_timeout: timeout]

    HTTPoison.post!(url, file, headers, options)
    |> handle_response
  end

  defp handle_response(response) do
    result = Jason.decode!(response.body)
    send(self(), {:raw_transcript, result})

    srt_transcript = convert_to_srt(result)

    if is_binary(srt_transcript),
      do: send(self(), {:srt_transcript, %{message: srt_transcript, is_final: true}})

    channels = result |> get_in(["results", "channels"])

    transcript =
      Enum.map(channels, fn %{"alternatives" => alternatives} ->
        alternatives
        |> List.first()
        |> Map.get("transcript")
      end)
      |> Enum.join("")

    if is_binary(transcript),
      do: send(self(), {:transcript, %{message: transcript, is_final: true}})

    :ok
  end

  defp build_url(url, opts) do
    query = Enum.map(opts, fn {key, value} -> "#{key}=#{URI.encode(value)}" end) |> Enum.join("&")

    if query !== "" do
      "#{url}&#{query}"
    else
      url
    end
  end

  defp convert_to_srt(data) do
    data
    |> get_in(["results", "channels"])
    |> Enum.flat_map(&get_alternatives(&1))
    |> Enum.flat_map(&get_paragraphs(&1))
    |> Enum.flat_map(&get_sentences_from_paragraph(&1))
    |> Buildel.Clients.Utils.Srt.main()
  end

  defp get_alternatives(%{"alternatives" => alternatives}), do: alternatives
  defp get_alternatives(_), do: []

  defp get_paragraphs(%{"paragraphs" => %{"paragraphs" => paragraphs}}), do: paragraphs
  defp get_paragraphs(_), do: []

  defp get_sentences_from_paragraph(%{"sentences" => sentences}), do: sentences
  defp get_sentences_from_paragraph(_), do: []
end
