defmodule Buildel.Blocks.DocumentSearch do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :query
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate text_input(name), to: Buildel.Blocks.Block
  defdelegate file_input(name, public), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "document_search",
      inputs: [file_input("files", true), text_input("query")],
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
        "opts" => options_schema()
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  # Server

  @impl true
  def init(
        [
          name: name,
          block_name: block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs ++ ["#{block_name}:files"])

    {:ok, collection} = Buildel.VectorDB.init(name)

    {:ok, state |> assign_stream_state |> Keyword.put(:collection, collection.name)}
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)
    results = Buildel.VectorDB.query(state[:collection], query)
    result = get_in(results, ["documents"]) |> Enum.at(0) |> Enum.at(0)

    Buildel.BlockPubSub.broadcast_to_io(
      state[:context_id],
      state[:block_name],
      "output",
      {:text, result}
    )

    state = send_stream_stop(state)

    {:noreply, state}
  end

  def handle_cast({:add_file, {:binary, file}}, state) do
    IO.puts("KUPAAAAA #{inspect(file)}")
    state = send_stream_start(state)
    Buildel.VectorDB.add_text(state[:collection], file)
    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_info({name, :binary, binary}, state) do
    add_file(self(), {:binary, binary})
    {:noreply, state}
  end

  @impl true
  def handle_info({name, :text, text}, state) do
    input(self(), {:text, text})

    {:noreply, state}
  end
end
