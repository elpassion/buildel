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

    srt_transcript = convert_to_srt(result)

    if srt_transcript,
      do: send(self(), {:srt_transcript, %{message: srt_transcript, is_final: true}})

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

  defp convert_to_srt(data) do
    data
    |> get_sentences()
    |> Enum.with_index(1)
    |> Enum.map(&format_sentence(&1))
    |> Enum.join("\n\n")
  end

  defp format_sentence({%{"start" => start, "end" => finish, "text" => text}, index}) do
    "#{index}\n#{format_srt_time(start)} --> #{format_srt_time(finish)}\n#{text}"
  end

  defp get_sentences(data) do
    data
    |> get_in(["results", "channels"])
    |> Enum.flat_map(fn %{"alternatives" => alternatives} ->
      alternatives
    end)
    |> Enum.flat_map(fn %{
                          "transcript" => _,
                          "paragraphs" => %{"paragraphs" => paragraphs}
                        } ->
      paragraphs
    end)
    |> Enum.flat_map(fn %{"sentences" => sentences} ->
      sentences
    end)
  end

  defp format_srt_time(seconds) do
    total_milliseconds = round(seconds * 1000)
    hours = div(total_milliseconds, 3_600_000)
    minutes = div(rem(total_milliseconds, 3_600_000), 60_000)
    secs = div(rem(total_milliseconds, 60_000), 1000)
    millisecs = rem(total_milliseconds, 1000)

    String.pad_leading(Integer.to_string(hours), 2, "0") <>
      ":" <>
      String.pad_leading(Integer.to_string(minutes), 2, "0") <>
      ":" <>
      String.pad_leading(Integer.to_string(secs), 2, "0") <>
      "," <>
      String.pad_leading(Integer.to_string(millisecs), 3, "0")
  end
end
