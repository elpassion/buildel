defmodule Buildel.Blocks.AudioOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :send_audio
  defdelegate audio_output(name, public), to: Buildel.Blocks.Block
  defdelegate audio_input(), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "audio_output",
      groups: ["audio", "inputs / outputs"],
      inputs: [audio_input()],
      outputs: [audio_output("output", true)],
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
        "opts" => options_schema()
      }
    }
  end

  # Client

  def send_audio(pid, {:binary, _chunk} = audio) do
    GenServer.cast(pid, {:send_audio, audio})
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

    {:ok, state |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_audio, {:binary, _chunk} = audio}, state) do
    state = state |> send_stream_start()

    BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      audio
    )

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, chunk}, state) do
    input(self(), {:binary, chunk})
    {:noreply, state}
  end
end
