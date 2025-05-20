defmodule Buildel.Blocks.OpenaiSpeechToText do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "openai_speech_to_text",
      description:
        "This module expertly transcribes audio content into text, using OpenAI's transcription models.",
      groups: ["audio", "text"],
      inputs: [Block.audio_input()],
      outputs: [
        Block.text_output()
      ],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["api_key", "language", "endpoint", "model"],
            "properties" => %{
              "api_key" =>
                secret_schema(%{
                  "title" => "API key",
                  "description" => "OpenAI API key"
                }),
              language: %{
                "type" => "string",
                "title" => "Language",
                "description" => "Language of the transcription.",
                "enum" => ["en", "pl", "es"],
                "enumPresentAs" => "radio",
                "default" => "en"
              },
              endpoint: %{
                "errorMessages" => %{
                  "minLength" => "Endpoint is required."
                },
                "type" => "string",
                "title" => "Endpoint",
                "description" => "The endpoint to use for the transcription.",
                "default" => "https://api.openai.com/v1/audio/transcriptions",
                "minLength" => 1
              },
              model: %{
                "type" => "string",
                "title" => "Model",
                "description" =>
                  "Model allows you to supply a model to use to process submitted audio.",
                "enum" => ["whisper-1", "gpt-4o-mini-transcribe", "gpt-4o-transcribe"],
                "enumPresentAs" => "radio",
                "default" => "whisper-1"
              },
              timeout: %{
                "type" => "number",
                "title" => "Stop after (ms)",
                "description" =>
                  "The temperature specifies the maximum duration (in ms.) for an operation to complete before the system terminates it due to inactivity or delay.",
                "default" => 10000,
                "minimum" => 0
              }
            }
          })
      }
    }
  end

  @impl true
  def setup(
        %{
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    api_key = block_context().get_secret_from_context(context_id, opts.api_key)

    client = openai().new(api_key)

    state = state |> Map.put(:api_key, api_key) |> Map.put(:client, client)
    {:ok, state}
  end

  def handle_input("input", {_name, :binary, chunk, metadata}, state) do
    state = state |> send_stream_start()
    language = state |> get_in([:opts, :language])
    model = state |> get_in([:opts, :model])
    endpoint = state |> get_in([:opts, :endpoint])

    params = %Buildel.Clients.Openai.TranscribeParams{
      model: model,
      language: language,
      endpoint: endpoint,
      filename: metadata[:file_name]
    }

    with {:ok, text} <-
           state[:client]
           |> openai().transcribe_audio({:binary, chunk}, params) do
      output(state, "output", {:text, text}, %{
        stream_start: :none
      })
    else
      {:error, error} ->
        state = state |> send_error(error["error"]["message"])
        state |> send_stream_stop()
    end
  end

  defp openai() do
    Application.fetch_env!(:buildel, :openai)
  end
end
