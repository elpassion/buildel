defmodule Buildel.Blocks.TextOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :send_text
  defdelegate text_output(name, public), to: Buildel.Blocks.Block
  defdelegate text_input(), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_output",
      inputs: [text_input()],
      outputs: [text_output("output", true)],
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

  def send_text(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:send_text, text})
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
  def handle_cast({:send_text, {:text, text_chunk}}, state) do
    state = state |> send_stream_start()

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, text_chunk}
    )

    state = state |> schedule_stream_stop()

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})
    {:noreply, state}
  end
end
