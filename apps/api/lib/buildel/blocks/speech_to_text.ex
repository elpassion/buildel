defmodule Buildel.Blocks.SpeechToText do
  use Buildel.Blocks.Block

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :transcript
  defdelegate text_output(name \\ "output"), to: Buildel.Blocks.Block
  defdelegate audio_input(), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "speech_to_text",
      groups: ["audio", "text"],
      inputs: [audio_input()],
      outputs: [text_output(), text_output("json_output"), text_output("srt_output")],
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
            "required" => ["api_key", "language"],
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
              timeout: %{
                "type" => "number",
                "title" => "Timeout",
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
        [
          name: _name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    api_key = block_secrets_resolver().get_secret_from_context(context_id, opts.api_key)

    {:ok,
     state
     |> Keyword.put(
       :api_key,
       api_key
     )
     |> Keyword.put(:clips, %{})
     |> assign_stream_state()}

    # api_key = block_secrets_resolver().get_secret_from_context(context_id, opts.api_key)

    # %{language: lang} = opts

    # case deepgram().connect!(api_key, %{stream_to: self(), language: lang}) do
    #   {:ok, deepgram_pid} ->
    #     {:ok, state |> Keyword.put(:deepgram_pid, deepgram_pid) |> assign_stream_state()}

    #   {:error, _reason} ->
    #     {:stop, {:error, block_name, :incorrect_api_key}}
    # end
  end

  @impl true
  def terminate(_reason, state) do
    state[:deepgram_pid] |> deepgram().disconnect()
    state
  end

  # @impl true
  # def handle_cast({:transcript, {:binary, chunk}}, state) do
  #   state = state |> send_stream_start()
  #   state |> Keyword.get(:deepgram_pid) |> deepgram().transcribe_audio({:binary, chunk})
  #   {:noreply, state}
  # end

  @impl true
  def handle_cast({:transcript, {:binary, chunk}}, state) do
    state = state |> send_stream_start()

    language = state |> get_in([:opts, :language])
    timeout = state |> get_in([:opts, :timeout])

    deepgram().transcribe(state[:api_key], chunk, %{language: language, timeout: timeout})

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

  def handle_info({_name, :binary, chunk}, state) do
    transcript(self(), {:binary, chunk})
    {:noreply, state}
  end

  defp deepgram() do
    Application.fetch_env!(:buildel, :deepgram)
  end
end
