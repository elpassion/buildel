defmodule Buildel.Blocks.MapList do
  use Buildel.Blocks.Block

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :map

  @impl true
  def options() do
    %{
      type: "map_list",
      description: "Used for mapping and transforming 1 input list into n outputs.",
      groups: ["utils"],
      inputs: [Block.text_input("list")],
      outputs: [Block.text_output()],
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
            "required" => [],
            "properties" => Jason.OrderedObject.new([])
          })
      }
    }
  end

  def map(pid, {:text, list}) do
    IO.inspect(list, label: "MapList")

    case Jason.decode(list) do
      {:ok, list} ->
        GenServer.cast(pid, {:map, list})

      {:error, _} ->
        GenServer.cast(pid, {:map, []})
    end
  end

  # Server

  @impl true
  def init(state) do
    subscribe_to_connections(state.context_id, state.connections)
    {:ok, state |> assign_stream_state()}
  end

  @impl true
  def handle_cast({:map, list}, state) do
    state = state |> send_stream_start("output")

    list
    |> Enum.each(
      &Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text, &1 |> Jason.encode!()}
      )
    )

    state = state |> send_stream_stop("output")

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, text}, state) do
    cast(self(), {:text, text})
    {:noreply, state}
  end
end
