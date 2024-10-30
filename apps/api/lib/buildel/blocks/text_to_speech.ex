defmodule Buildel.Blocks.TextToSpeech do
  use Buildel.Blocks.Block

  # Config
  @impl true
  def options() do
    %{
      type: "text_to_speech",
      description:
        "This module enables seamless conversion of textual data into audio format, leveraging the ElevenLabs API.",
      groups: ["text", "audio"],
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
      "required" => ["name", "inputs", "opts"],
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
                })
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
    state = state |> Map.put(:stream_to, self())

    case elevenlabs().speak!(api_key, %{stream_to: self()}) do
      {:ok, elevenlabs_pid} ->
        {:ok, state |> Map.put(:elevenlabs_pid, elevenlabs_pid)}

      {:error, _reason} ->
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

  def handle_info({:reconnect}, state) do
    state[:elevenlabs_pid] |> elevenlabs().disconnect()

    api_key = block_context().get_secret_from_context(state.context_id, state.opts.api_key)

    state =
      case elevenlabs().speak!(api_key, %{stream_to: self()}) do
        {:ok, elevenlabs_pid} ->
          state |> Map.put(:elevenlabs_pid, elevenlabs_pid)

        {:error, _reason} ->
          state |> send_error(:incorrect_api_key)
          state
      end

    {:noreply, state}
  end

  def handle_info({:audio_chunk, binary}, state) do
    state = state |> output("output", {:binary, binary}, %{metadata: %{}, stream_stop: :schedule})
    {:noreply, state}
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
