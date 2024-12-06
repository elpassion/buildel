defmodule Buildel.Blocks.NewTextToSpeech do
  use Buildel.Blocks.NewBlock

  import Buildel.Blocks.Utils.Schemas

  defblock(:text_to_speech,
    description:
      "This module enables seamless conversion of textual data into audio format, leveraging the ElevenLabs API.",
    groups: ["text", "audio"]
  )

  definput(:input, schema: %{})

  defoutput(:output, schema: %{}, type: :audio)

  defoption(
    :api_key,
    secret_schema(%{
      "title" => "API key",
      "description" => "Elevenlabs API key",
      "readonly" => true
    })
  )

  def setup(state) do
    api_key = secret(state, option(state, :api_key))
    state = state |> Map.put(:stream_to, self())

    case elevenlabs().speak!(api_key, %{stream_to: self()}) do
      {:ok, elevenlabs_pid} ->
        {:ok, state |> Map.put(:elevenlabs_pid, elevenlabs_pid)}

      {:error, _reason} ->
        {:stop, {:error, state.block.name, :incorrect_api_key}}
    end
  end

  def terminate(_reason, state) do
    state[:elevenlabs_pid] |> elevenlabs().disconnect()

    {:ok, state}
  end

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    state = speak(message.message, state)

    {:ok, state}
  end

  defp speak(chunk, state) do
    state |> Map.get(:elevenlabs_pid) |> elevenlabs().generate_speech(chunk)

    state
  end

  def handle_info({:reconnect}, state) do
    state[:elevenlabs_pid] |> elevenlabs().disconnect()

    api_key = secret(state, option(state, :api_key))

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
    output(state, :output, Message.new(:audio_binary, binary))

    {:noreply, state}
  end

  def handle_input_stream_stop(_name, _message, state) do
    state |> Map.get(:elevenlabs_pid) |> elevenlabs().flush()

    {:ok, state}
  end

  defp elevenlabs() do
    Application.fetch_env!(:buildel, :elevenlabs)
  end
end
