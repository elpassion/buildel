defmodule Buildel.Blocks.FileSpeechToText do
  use Buildel.Blocks.Block

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :transcript

  @impl true
  def options() do
    %{
      type: "file_speech_to_text",
      description:
        "This module expertly transcribes audio content into text, offering multiple output formats including plain text, JSON, and SRT.",
      groups: ["audio", "text"],
      inputs: [Block.audio_input()],
      outputs: [
        Block.text_output(),
        Block.text_output("json_output"),
        Block.text_output("srt_output")
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
            "required" => ["api_key"],
            "properties" => %{
              "api_key" =>
                secret_schema(%{
                  "title" => "API key",
                  "description" => "Deepgram API key"
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
                "enum" => ["base", "enhanced"],
                "enumPresentAs" => "radio",
                "default" => "base"
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

  # Client
  def transcript(pid, {:binary, _chunk} = audio) do
    GenServer.cast(pid, {:transcript, audio})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    api_key = block_context().get_secret_from_context(context_id, opts.api_key)

    {:ok,
     state
     |> Map.put(:api_key, api_key)
     |> assign_stream_state()}
  end

  @impl true
  def terminate(_reason, state) do
    state[:deepgram_pid] |> deepgram().disconnect()
    state
  end

  @impl true
  def handle_cast({:transcript, {:binary, chunk}}, state) do
    state = state |> send_stream_start()

    language = state |> get_in([:opts, :language])
    timeout = state |> get_in([:opts, :timeout])
    model = state |> get_in([:opts, :model])

    deepgram().transcribe_file(state[:api_key], chunk, %{
      language: language,
      timeout: timeout,
      model: model
    })

    {:noreply, state}
  end

  @impl true
  def handle_info({:transcript, %{message: "", is_final: _}}, state) do
    {:noreply, state}
  end

  def handle_info({:transcript, %{message: text, is_final: true}}, state) do
    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, text}
    )

    state = state |> send_stream_stop()

    {:noreply, state}
  end

  def handle_info({:srt_transcript, %{message: text, is_final: true}}, state) do
    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "srt_output",
      {:text, text}
    )

    state = state |> send_stream_stop()

    {:noreply, state}
  end

  def handle_info({:raw_transcript, message}, state) do
    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "json_output",
      {:text, message}
    )

    {:noreply, state}
  end

  def handle_input("input", {_name, :binary, chunk, _metadata}, state) do
    transcript(self(), {:binary, chunk})
    state
  end

  defp deepgram() do
    Application.fetch_env!(:buildel, :deepgram)
  end
end
