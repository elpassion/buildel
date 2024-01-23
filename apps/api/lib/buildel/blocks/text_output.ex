defmodule Buildel.Blocks.TextOutput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :send_text

  @impl true
  def options() do
    %{
      type: "text_output",
      description: "A versatile module designed to output text data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("output", true)],
      ios: [],
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
            "required" => ["stream_timeout"],
            "properties" => %{
              "stream_timeout" => %{
                "type" => "number",
                "title" => "Stop after (ms)",
                "description" =>
                  "Wait this many milliseconds after receiving the last chunk before stopping the stream.",
                "minimum" => 500,
                "default" => 500,
                "step" => 1
              }
            }
          })
      }
    }
  end

  # Client

  def send_text(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:send_text, text})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, state |> assign_stream_state(opts)}
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
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
