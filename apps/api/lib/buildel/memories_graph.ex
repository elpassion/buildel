defmodule Buildel.MemoriesGraph do
  require Logger
  alias Buildel.Organizations.Organization
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Memories.MemoryCollectionSearch

  import Ecto.Query

  alias Buildel.Repo

  defmodule State do
    defstruct tasks: %{}

    defmodule Task do
      defstruct [:pid, :collection]
    end

    def new(tasks \\ %{}) do
      %State{tasks: tasks}
    end

    def add(%State{} = state, %Task{} = task) do
      %{state | tasks: state.tasks |> Map.put(task.collection.id, task)}
    end

    def remove(%State{} = state, collection_id) do
      %{state | tasks: state.tasks |> Map.delete(collection_id)}
    end
  end

  use GenServer

  def start_link(args) do
    GenServer.start_link(__MODULE__, args, name: __MODULE__)
  end

  def init(_args) do
    Process.flag(:max_heap_size, 0)
    {:ok, State.new(%{})}
  end

  def get_state(collection_id) do
    GenServer.call(__MODULE__, {:get, collection_id})
  end

  ########

  def handle_cast({:add, task}, state) do
    state = state |> State.add(task)

    {:noreply, state}
  end

  def handle_cast({:remove, collection_id}, state) do
    state = state |> State.remove(collection_id)

    {:noreply, state}
  end

  def handle_call({:get, collection_id}, _, state) do
    response =
      case state.tasks |> Map.get(collection_id) do
        nil -> {:ok, nil}
        task -> {:ok, task}
      end

    {:reply, response, state}
  end

  def stop_generating(collection_id) do
    {:ok, %State.Task{} = task} = get_state(collection_id)
    Task.Supervisor.terminate_child(Buildel.TaskSupervisor, task.pid)
    GenServer.cast(__MODULE__, {:remove, collection_id})

    :ok
  end

  def get_graph(
        %Organization{} = organization,
        %MemoryCollection{} = collection
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    query =
      from c in Buildel.VectorDB.EctoAdapter.Chunk,
        where: c.collection_name == ^collection_name,
        join: p in Buildel.VectorDB.EctoAdapter.MemoryGraphPoint,
        on: p.id == c.id

    query =
      from [c, p] in query,
        select: {p.point, c.id, c.document, c.metadata}

    Repo.all(query)
    |> Enum.map(fn {point, id, document, metadata} ->
      %{
        id: id,
        point: point,
        document: document,
        metadata: metadata
      }
    end)
  end

  def get_node_details(
        %Organization{} = _organization,
        %MemoryCollection{} = _collection,
        chunk_id
      ) do
    Buildel.VectorDB.EctoAdapter.Chunk
    |> where(id: ^chunk_id)
    |> join(:left, [c], p in Buildel.VectorDB.EctoAdapter.MemoryGraphPoint, on: p.id == c.id)
    |> select(
      [c],
      %{
        c
        | embedding_1536: nil,
          embedding_3072: nil,
          embedding_384: nil
      }
    )
    |> select_merge([_c, p], %{point: p.point})
    |> Repo.one()
    |> case do
      nil ->
        {:error, :not_found}

      chunk ->
        {:ok, chunk}
    end
  end

  def get_related_nodes(
        %Organization{} = organization,
        %MemoryCollection{} = collection,
        chunk_id,
        limit \\ 5
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    vector_db =
      Buildel.VectorDB.new(%{
        adapter: Buildel.VectorDB.EctoAdapter,
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: "openai",
            model: "",
            api_key: "",
            endpoint: ""
          })
      })

    with chunk when not is_nil(chunk) <-
           Buildel.VectorDB.get_by_id(vector_db, collection_name, chunk_id) do
      params =
        MemoryCollectionSearch.Params.from_map(%{
          search_query: Map.get(chunk, "document"),
          search_embeddings: Map.get(chunk, "embedding"),
          limit: limit,
          extend_neighbors: false,
          extend_parents: false,
          token_limit: nil
        })

      {result, _total_tokens, _embeddings_tokens} =
        MemoryCollectionSearch.new(%{
          vector_db: vector_db,
          organization_collection_name: collection_name
        })
        |> MemoryCollectionSearch.search(params)

      result |> Enum.drop(1)
    else
      nil -> []
    end
  end

  def generate_and_save_graph(
        %Organization{} = organization,
        %MemoryCollection{} = collection,
        memory \\ nil
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    if should_build?(memory, collection_name) do
      %Task{pid: pid} =
        Task.Supervisor.async(
          Buildel.TaskSupervisor,
          fn ->
            FLAME.call(
              Buildel.CollectionGraphRunner,
              fn ->
                case reduce_dimensions(organization, collection, memory) do
                  :ok -> :ok
                  e -> Logger.debug("Failed to reduce dimensions: #{inspect(e)}")
                end
              end,
              timeout: 5 * 60_000
            )

            GenServer.cast(__MODULE__, {:remove, collection.id})
          end,
          shutdown: 5 * 60_000
        )

      GenServer.cast(__MODULE__, {:add, %State.Task{collection: collection, pid: pid}})
    end

    :ok
  end

  def reduce_dimensions(
        %Organization{} = organization,
        %MemoryCollection{} = collection,
        memory
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)
    memory_id = if memory, do: memory.id, else: nil

    Buildel.PythonWorker.reduce_dimensions(collection_name, memory_id)

    IO.inspect("Saved reduced embeddings")

    :ok
  end

  defp should_build?(memory, collection_name) do
    !memory || graph_exists?(collection_name)
  end

  defp graph_exists?(collection_name) do
    Buildel.VectorDB.EctoAdapter.MemoryGraphPoint
    |> where(graph_name: ^collection_name)
    |> Buildel.Repo.exists?()
  end
end
