defmodule Buildel.Blocks.NewFileSpeechToText do
  use Buildel.Blocks.NewBlock
  import Buildel.Blocks.Utils.Schemas

  defblock(:file_speech_to_text,
    description:
      "This module expertly transcribes audio content into text, offering multiple output formats including plain text, JSON, and SRT.",
    groups: ["audio", "text"]
  )

  definput(:input, schema: %{}, type: :audio)

  defoutput(:output, schema: %{})

  defoutput(:json_output, schema: %{})

  defoutput(:srt_output, schema: %{})

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

  def handle_info({:srt_transcript, %{message: text, is_final: true}} = _message, state) do
    output(state, :srt_output, Message.new(:text, text))

    {:noreply, state}
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

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    transcript(message.message, state)

    {:ok, state}
  end

  defp transcript(chunk, state) do
    language = option(state, :language)
    timeout = option(state, :timeout)
    model = option(state, :model)

    deepgram().transcribe_file(secret(state, option(state, :api_key)), chunk, %{
      language: language,
      timeout: timeout,
      model: model
    })
  end

  defp deepgram() do
    Application.fetch_env!(:buildel, :deepgram)
  end
end
