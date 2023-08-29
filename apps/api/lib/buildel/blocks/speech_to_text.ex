defmodule Buildel.Blocks.SpeechToText do
  use Buildel.Blocks.Block

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :transcript
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate audio_input(), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "speech_to_text",
      inputs: [audio_input()],
      outputs: [text_output()],
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
              "api_key" => %{
                "type" => "string",
                "title" => "API Key",
                "description" => "Deepgram API key",
                "minLength" => 1
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
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)
    api_key = opts |> Map.get(:api_key, System.get_env("DEEPGRAM_API_KEY"))

    deepgram_pid =
      deepgram().connect!(api_key, %{stream_to: self()})

    {:ok, state |> Keyword.put(:deepgram_pid, deepgram_pid) |> assign_stream_state}
  end

  @impl true
  def terminate(_reason, state) do
    state[:deepgram_pid] |> deepgram().disconnect()
    state
  end

  @impl true
  def handle_cast({:transcript, {:binary, chunk}}, state) do
    state = state |> send_stream_start()
    state |> Keyword.get(:deepgram_pid) |> deepgram().transcribe_audio({:binary, chunk})
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

  def handle_info({_name, :binary, chunk}, state) do
    transcript(self(), {:binary, chunk})
    {:noreply, state}
  end

  defp deepgram() do
    Application.get_env(:bound, :deepgram, Buildel.Clients.Deepgram)
  end
end
