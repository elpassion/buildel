defmodule Buildel.Blocks.SplitText do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :split

  @impl true
  def options() do
    %{
      type: "split_text",
      groups: ["utils", "text"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("output")],
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
            "required" => ["condition"],
            "properties" => %{
              chunk_size: %{
                "type" => "number",
                "title" => "Chunk size",
                "description" => "The value to compare the input to",
                "minimum" => 0,
                "default" => 500
              }
            }
          })
      }
    }
  end

  # Client

  def split(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:split, text})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__, opts: opts} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, state |> assign_stream_state |> Map.put(:chunk_size, opts[:chunk_size])}
  end

  @impl true
  def handle_cast({:split, {:text, text_value}}, state) do
    state = state |> send_stream_start("output")

    text_value
    |> String.codepoints()
    |> Enum.chunk_every(state[:chunk_size])
    |> Enum.take(1)
    |> Enum.map(fn chunk ->
      BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text,
         chunk
         |> Enum.join("")}
      )
    end)

    state = state |> send_stream_stop("output")

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
