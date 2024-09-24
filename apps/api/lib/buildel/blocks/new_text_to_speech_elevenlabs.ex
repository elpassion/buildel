defmodule Buildel.Blocks.NewTextToSpeechElevenlabs do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "new_text_to_speech_elevenlabs",
      description:
        "This module is adept at transcribing audio data into text, offering outputs in both plain text and JSON formats.",
      groups: ["audio", "text"],
      inputs: [Block.text_input()],
      outputs: [Block.audio_output()],
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
            "required" => ["api_key"],
            "properties" => %{
              "api_key" =>
                secret_schema(%{
                  "title" => "API key",
                  "description" => "Elevenlabs API key"
                }),
              language: %{
                "type" => "string",
                "title" => "Language",
                "description" => "Language of the transcription.",
                "enum" => ["en", "pl", "es"],
                "enumPresentAs" => "radio",
                "default" => "en"
              },
              model: %{
                "type" => "string",
                "title" => "Model",
                "description" =>
                  "Model allows you to supply a model to use to process submitted audio.",
                "enum" => ["aura-asteria-en", "enhanced"],
                "enumPresentAs" => "radio",
                "default" => "aura-asteria-en"
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
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    api_key = block_context().get_secret_from_context(context_id, opts.api_key)

    lang = Map.get(opts, :language, "en")
    model = Map.get(opts, :model, "aura-asteria-en")

    case elevenlabs().speak!(api_key, %{stream_to: self()}) |> IO.inspect() do
      {:ok, elevenlabs_pid} ->
        {:ok, state |> Map.put(:elevenlabs_pid, elevenlabs_pid)}

      {:error, reason} ->
        IO.inspect(reason |> WebSockex.RequestError.message())
        {:stop, {:error, block_name, :incorrect_api_key}}
    end
  end

  @impl true
  def terminate(_reason, state) do
    state[:elevenlabs_pid] |> elevenlabs().disconnect()
    state
  end

  defp speak(chunk, state) do
    state = state |> send_stream_start()

    state |> Map.get(:elevenlabs_pid) |> elevenlabs().generate_speech(chunk)

    state
  end

  def handle_input("input", {_name, :text, chunk, _metadata}, state) do
    speak(chunk, state)
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    state |> Map.get(:elevenlabs_pid) |> elevenlabs().flush()
    {:noreply, state}
  end

  defp elevenlabs() do
    Application.fetch_env!(:buildel, :elevenlabs)
  end
end
