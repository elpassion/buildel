defmodule Buildel.Blocks.TextInput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :send_text
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate text_input(name, public), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_input",
      groups: ["text", "inputs / outputs"],
      inputs: [text_input("input", true)],
      outputs: [text_output()],
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

  def send_text(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:send_text, text})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: _opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, ["#{block_name}:input"])

    {:ok, state |> assign_stream_state}
  end

  @impl true
  def handle_cast({:send_text, {:text, text_chunk}}, state) do
    state = send_stream_start(state)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, text_chunk}
    )

    state = send_stream_stop(state)

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    input(self(), {:text, text})
    {:noreply, state}
  end
end
