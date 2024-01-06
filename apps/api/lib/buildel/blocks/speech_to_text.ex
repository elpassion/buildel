defmodule Buildel.Blocks.SpeechToText do
  use Buildel.Blocks.Block

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :transcript

  @impl true
  def options() do
    %{
      type: "speech_to_text",
      groups: ["audio", "text"],
      inputs: [Block.audio_input()],
      outputs: [Block.text_output(), Block.text_output("json_output")],
      ios: [],
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
  def init(
        %{
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    subscribe_to_connections(context_id, state.connections)

    api_key = block_secrets_resolver().get_secret_from_context(context_id, opts.api_key)

    lang = Map.get(opts, :language, "en")
    model = Map.get(opts, :model, "base")

    case deepgram().connect!(api_key, %{stream_to: self(), language: lang, model: model}) do
      {:ok, deepgram_pid} ->
        {:ok, state |> Map.put(:deepgram_pid, deepgram_pid) |> assign_stream_state()}

      {:error, _reason} ->
        {:stop, {:error, block_name, :incorrect_api_key}}
    end
  end

  @impl true
  def terminate(_reason, state) do
    state[:deepgram_pid] |> deepgram().disconnect()
    state
  end

  @impl true
  def handle_cast({:transcript, {:binary, chunk}}, state) do
    state = state |> send_stream_start()

    state |> Map.get(:deepgram_pid) |> deepgram().transcribe_audio({:binary, chunk})

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

  def handle_info({:raw_transcript, message}, state) do
    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "json_output",
      {:text, message}
    )

    {:noreply, state}
  end

  def handle_info({_name, :binary, chunk}, state) do
    transcript(self(), {:binary, chunk})
    {:noreply, state}
  end

  defp deepgram() do
    Application.fetch_env!(:buildel, :deepgram)
  end
end
