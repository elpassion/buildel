defmodule Buildel.Blocks.NewSpeechToText do
  use Buildel.Blocks.NewBlock

  import Buildel.Blocks.Utils.Schemas

  defblock(:speech_to_text,
    description:
      "This module is adept at transcribing audio data into text, offering outputs in both plain text and JSON formats.",
    groups: ["audio", "text"]
  )

  definput(:input, schema: %{}, type: :audio)

  defoutput(:output, schema: %{})

  defoutput(:json_output, schema: %{})

  defoutput(:end, schema: %{})

  defoption(
    :language,
    %{
      "type" => "string",
      "title" => "Language",
      "description" => "Language of the transcription.",
      "enum" => ["en", "pl", "es"],
      "enumPresentAs" => "radio",
      "default" => "en",
      "readonly" => true
    },
    required: false
  )

  defoption(
    :api_key,
    secret_schema(%{
      "title" => "API key",
      "description" => "Deepgram API key",
      "readonly" => true
    })
  )

  defoption(
    :model,
    %{
      "type" => "string",
      "title" => "Model",
      "description" => "Model allows you to supply a model to use to process submitted audio.",
      "enum" => ["base", "enhanced", "nova-2-phonecall"],
      "enumPresentAs" => "radio",
      "default" => "base",
      "readonly" => true
    },
    required: false
  )

  defoption(
    :timeout,
    %{
      "type" => "number",
      "title" => "Stop after (ms)",
      "description" =>
        "The temperature specifies the maximum duration (in ms.) for an operation to complete before the system terminates it due to inactivity or delay.",
      "default" => 10000,
      "minimum" => 0,
      "readonly" => true
    },
    required: false
  )

  def setup(state) do
    api_key = secret(state, option(state, :api_key))
    lang = option(state, :language)
    model = option(state, :model)

    state = state |> Map.put(:stream_to, self())

    case deepgram().listen!(api_key, %{stream_to: self(), language: lang, model: model}) do
      {:ok, deepgram_pid} ->
        Process.send_after(self(), {:keep_alive}, 5000)

        {:ok, state |> Map.put(:deepgram_pid, deepgram_pid)}

      {:error, _reason} ->
        {:stop, {:error, state.block.name, :incorrect_api_key}}
    end
  end

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    state = transcript(message.message, state)

    {:ok, state}
  end

  def terminate(_reason, state) do
    state[:deepgram_pid] |> deepgram().disconnect()

    {:ok, state}
  end

  defp transcript(chunk, state) do
    state |> Map.get(:deepgram_pid) |> deepgram().transcribe_audio({:binary, chunk})

    state
  end

  def handle_info({:raw_transcript, message}, state) do
    output(state, :json_output, Message.new(:json, message))

    {:noreply, state}
  end

  def handle_info({:transcript, %{message: "", is_final: _}} = _message, state) do
    {:noreply, state}
  end

  def handle_info({:transcript, %{message: text}} = _message, state) do
    output(state, :output, Message.new(:text, text))

    {:noreply, state}
  end

  def handle_info({:end}, state) do
    output(state, :end, Message.new(:text, ""))

    {:noreply, state}
  end

  def handle_info({:keep_alive}, state) do
    deepgram().keep_alive(state.deepgram_pid)

    Process.send_after(self(), {:keep_alive}, 5000)

    {:noreply, state}
  end

  defp deepgram() do
    Application.fetch_env!(:buildel, :deepgram)
  end
end
