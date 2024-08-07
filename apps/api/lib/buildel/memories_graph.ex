defmodule Buildel.MemoriesGraph do
  alias Buildel.Organizations.Organization
  alias Buildel.Memories.MemoryCollection

  import Ecto.Query

  alias Buildel.Repo

  defmodule State do
    defstruct collections: %{}

    def new(collections \\ %{}) do
      %State{collections: collections}
    end

    def add_collection(%State{} = state, collection) do
      %{state | collections: state.collections |> Map.put(collection.id, collection)}
    end

    def update_collection(%State{} = state, collection) do
      %{state | collections: state.collections |> Map.put(collection.id, collection)}
    end

    def remove_collection(%State{} = state, collection_id) do
      %{state | collections: state.collections |> Map.delete(collection_id)}
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

  def handle_cast({:add, collection}, state) do
    state = state |> State.add_collection(collection)

    {:noreply, state}
  end

  def handle_cast({:remove, collection_id}, state) do
    IO.inspect("Removing collection #{collection_id}")
    state = state |> State.remove_collection(collection_id)

    {:noreply, state}
  end

  def handle_call({:get, collection_id}, _, state) do
    response =
      case state.collections |> Map.get(collection_id) do
        nil -> {:ok, nil}
        collection -> {:ok, collection}
      end

    {:reply, response, state}
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

  def generate_and_save_graph(
        %Organization{} = organization,
        %MemoryCollection{} = collection
      ) do
    GenServer.cast(__MODULE__, {:add, collection})

    Task.async(fn ->
      FLAME.call(Buildel.CollectionGraphRunner, fn ->
        reduce_dimensions(organization, collection)
        GenServer.cast(__MODULE__, {:remove, collection.id})
      end)
    end)

    :ok
  end

  defp reduce_dimensions(
         %Organization{} = organization,
         %MemoryCollection{} = collection
       ) do
    collection_name = Buildel.Memories.organization_collection_name(organization, collection)

    result =
      Repo.all(
        from c in Buildel.VectorDB.EctoAdapter.Chunk,
          select: {c.embedding_3072, c.embedding_1536, c.embedding_384, c.id},
          where: c.collection_name == ^collection_name
      )

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

    Enum.each(reduced_embeddings, fn %{id: id, point: point} ->
      from(c in Buildel.VectorDB.EctoAdapter.Chunk,
        where: c.id == ^id
      )
      |> Repo.update_all(set: [embedding_reduced_2: point])
    end)

    :ok
  end
end
