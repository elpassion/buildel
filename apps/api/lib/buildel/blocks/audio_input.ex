defmodule Buildel.Blocks.AudioInput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_audio

  @impl true
  def options() do
    %{
      type: "audio_input",
      description: "A specialized block designed for capturing and streaming audio data.",
      groups: ["audio", "inputs / outputs"],
      inputs: [Block.audio_input("input", true)],
      outputs: [Block.audio_output()],
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
  def init(%{context_id: context_id, type: __MODULE__} = state) do
    subscribe_to_connections(
      context_id,
      state.connections ++ public_connections(state.block.name)
    )

    {:ok, state |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_audio, {:binary, _chunk} = audio}, state) do
    state = send_stream_start(state)

    BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      audio
    )

    state = schedule_stream_stop(state)

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :binary, chunk}, state) do
    cast(self(), {:binary, chunk})
    {:noreply, state}
  end
end
