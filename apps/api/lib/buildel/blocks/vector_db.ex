defmodule Buildel.Blocks.VectorDB do
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :query
  defdelegate text_output(), to: Buildel.Blocks.Block
  defdelegate text_input(name), to: Buildel.Blocks.Block
  defdelegate file_input(name), to: Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "vector_db",
      groups: ["file", "memory"],
      inputs: [file_input("files"), text_input("query")],
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
            "required" => ["api_key", "persist_in"],
            "properties" => %{
              "api_key" => secret_schema(%{
                "title" => "API Key",
                "description" => "Select from your API keys or enter a new one.",
              }),
              "persist_in" => %{
                "type" => "string",
                "title" => "Persist in",
                "enum" => ["run", "workflow"],
                "enumPresentAs" => "radio",
                "description" =>
                  "Where to hold data from inputs. Can be 'run' - resetting for every run of workflow, 'workflow' - persisted across runs.",
                "default" => "run"
              }
            }
          })
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
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    {:ok, collection} = Buildel.VectorDB.init(name)

    {:ok,
     state
     |> assign_stream_state
     |> Keyword.put(:collection, collection.name)
     |> Keyword.put(
       :api_key,
       block_secrets_resolver().get_secret_from_context(context_id, opts |> Map.get(:api_key))
     )}
  end

  @impl true
  def handle_cast({:query, {:text, query}}, state) do
    state = send_stream_start(state)
    results = Buildel.VectorDB.query(state[:collection], query, api_key: state[:api_key])
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
    state = send_stream_start(state)

    documents =
      Buildel.Splitters.recursive_character_text_split(file, %{
        chunk_size: 1000,
        chunk_overlap: 200
      })
      |> Enum.map(fn document ->
        %{
          document: document,
          metadata: %{memory_id: "TODO: FIX", chunk_id: UUID.uuid4()}
        }
      end)

    Buildel.VectorDB.add(state[:collection], documents, api_key: state[:api_key])
    state = send_stream_stop(state)
    {:noreply, state}
  end

  @impl true
  def handle_info({name, :binary, binary}, state) do
    case get_input(state[:opts].inputs, name) do
      "files" -> add_file(self(), {:binary, binary})
      _ -> {:noreply, state}
    end

    {:noreply, state}
  end

  @impl true
  def handle_info({name, :text, text}, state) do
    case get_input(state[:opts].inputs, name) do
      "query" -> input(self(), {:text, text})
      _ -> {:noreply, state}
    end

    {:noreply, state}
  end
end
