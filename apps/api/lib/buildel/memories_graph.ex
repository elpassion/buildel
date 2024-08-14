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

    Repo.all(
      from c in Buildel.VectorDB.EctoAdapter.Chunk,
        select: {c.embedding_reduced_2, c.id, c.document, c.metadata},
        where: c.collection_name == ^collection_name and not is_nil(c.embedding_reduced_2)
    )
    |> Enum.map(fn {embedding_reduced_2, id, document, metadata} ->
      %{
        id: id,
        embedding_reduced_2: Pgvector.to_list(embedding_reduced_2),
        document: document,
        metadata: metadata
      }
    end)
  end

  def get_node_details(
        %Organization{} = organization,
        %MemoryCollection{} = collection,
        chunk_id
      ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    Repo.one(
      from c in Buildel.VectorDB.EctoAdapter.Chunk,
        select: %{
          c
          | embedding_1536: nil,
            embedding_3072: nil,
            embedding_384: nil
        },
        where: c.collection_name == ^collection_name and c.id == ^chunk_id
    )
    |> case do
      nil ->
        {:error, :not_found}

      chunk ->
        {:ok, %{chunk | embedding_reduced_2: Pgvector.to_list(chunk.embedding_reduced_2)}}
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

    chunk = Buildel.VectorDB.get_by_id(vector_db, collection_name, chunk_id)

    params =
      MemoryCollectionSearch.Params.from_map(%{
        search_query: Map.get(chunk, "embedding"),
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
  end

  def generate_and_save_graph(
        %Organization{} = organization,
        %MemoryCollection{} = collection
      ) do
    %Task{pid: pid} =
      Task.Supervisor.async(
        Buildel.TaskSupervisor,
        fn ->
          FLAME.call(
            Buildel.CollectionGraphRunner,
            fn ->
              case reduce_dimensions(organization, collection) do
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

    :ok
  end

  defp reduce_dimensions(
         %Organization{} = organization,
         %MemoryCollection{} = collection
       ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    with result when result != [] <-
           Repo.all(
             from c in Buildel.VectorDB.EctoAdapter.Chunk,
               select: {c.embedding_3072, c.embedding_1536, c.embedding_384, c.id},
               where: c.collection_name == ^collection_name
           )
           |> Enum.shuffle() do
      embeddings =
        case Enum.at(result, 0) do
          {_, nil, nil, _} ->
            result |> Enum.map(fn {embedding, _, _, _id} -> Pgvector.to_list(embedding) end)

          {nil, _, nil, _} ->
            result |> Enum.map(fn {_, embedding, _, _id} -> Pgvector.to_list(embedding) end)

          {nil, nil, _, _} ->
            result |> Enum.map(fn {_, _, embedding, _id} -> Pgvector.to_list(embedding) end)
        end

      result =
        result |> Enum.map(fn {_, _, _, id} -> %{id: id} end)

      tensor_data = Nx.tensor(embeddings)

      reduced_embeddings =
        Scholar.Manifold.TSNE.fit(tensor_data,
          key: Nx.Random.key(42),
          num_components: 2,
          perplexity: 15,
          exaggeration: 10.0,
          learning_rate: 500,
          init: :random,
          metric: :squared_euclidean
        )
        |> Nx.to_list()
        |> Enum.with_index()
        |> Enum.map(fn {point, index} ->
          record = Enum.at(result, index)
          %{id: record.id, point: point}
        end)

      Enum.reduce(reduced_embeddings, Ecto.Multi.new(), fn %{id: id, point: point}, multi ->
        multi
        |> Ecto.Multi.update_all(
          id |> String.to_atom(),
          fn _ ->
            from(c in Buildel.VectorDB.EctoAdapter.Chunk,
              where: c.id == ^id,
              update: [set: [embedding_reduced_2: ^point]]
            )
          end,
          []
        )
      end)
      |> Buildel.Repo.transaction()

      :ok
    else
      result when is_list(result) ->
        :ok

      e ->
        e
    end
  end
end
