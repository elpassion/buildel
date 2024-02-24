defmodule Buildel.VectorDB do
  alias __MODULE__
  alias Buildel.Utils.TelemetryWrapper
  alias Buildel.Clients.Embeddings
  use TelemetryWrapper
  @enforce_keys [:adapter, :embeddings]
  defstruct [:adapter, :embeddings]

  @type t :: %VectorDB{}

  @spec new(%{
          :adapter => Buildel.VectorDB.VectorDBAdapterBehaviour,
          :embeddings => Buildel.Clients.Embeddings.t(),
          optional(any()) => any()
        }) :: t()
  def new(%{adapter: adapter, embeddings: embeddings}) do
    %__MODULE__{adapter: adapter, embeddings: embeddings}
  end

  def init(%__MODULE__{adapter: adapter, embeddings: embeddings}, collection_name) do
    with {:ok, _collection} <-
           adapter.create_collection(
             collection_name,
             Embeddings.get_config(embeddings)
           ) do
      {:ok, %{name: collection_name}}
    else
      {:error, error} -> {:error, error}
    end
  end

  def add(%__MODULE__{adapter: adapter, embeddings: embeddings}, collection_name, documents) do
    inputs = documents |> Enum.map(&Map.get(&1, :document))

    ids =
      documents
      |> Enum.map(&get_in(&1, [:metadata, :chunk_id]))

    {:ok, embeddings_list} = Embeddings.get_embeddings(embeddings, inputs)

    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.add(collection, %{
      embeddings: embeddings_list,
      documents: documents,
      ids: ids
    })

    {:ok, collection}
  end

  deftimed query(
             %__MODULE__{adapter: adapter, embeddings: embeddings},
             collection_name,
             query,
             options
           ),
           [
             :buildel,
             :vector_db,
             :query
           ] do
    options = Map.merge(%{limit: 5, similarity_threshhold: 0.75}, options)

    {:ok, embeddings_list} = Embeddings.get_embeddings(embeddings, [query])

    {:ok, collection} = adapter.get_collection(collection_name)

    {:ok, results} =
      adapter.query(collection, %{
        query_embeddings: embeddings_list |> List.first(),
        limit: options.limit,
        similarity_treshhold: options.similarity_threshhold
      })

    results
  end

  def get_all(%__MODULE__{adapter: adapter}, collection_name, metadata \\ %{}, params \\ %{}) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.get_all(collection, metadata, params)
  end

  def delete_all_with_metadata(%__MODULE__{adapter: adapter}, collection_name, metadata) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.delete_all_with_metadata(collection, metadata)
  end
end

defmodule Buildel.VectorDB.VectorDBAdapterBehaviour do
  @callback get_collection(String.t()) :: {:ok, map()}
  @callback create_collection(String.t(), map()) :: {:ok, map()}
  @callback delete_all_with_metadata(map(), map()) :: :ok
  @callback add(map(), map()) :: :ok
  @callback query(map(), map()) :: {:ok, list()}
end

defmodule Buildel.VectorDB.QdrantAdapter do
  @behaviour Buildel.VectorDB.VectorDBAdapterBehaviour

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def get_collection(collection_name) do
    {:ok, _} = Qdrant.collection_info(collection_name)

    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def create_collection(collection_name, opts \\ %{}) do
    opts = Map.merge(%{size: 1536, distance: "Cosine"}, opts)

    with {:ok, _} <-
           Qdrant.create_collection(collection_name, %{vectors: opts}) do
      {:ok, %{name: collection_name}}
    else
      error ->
        {:error, error}
    end
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def add(collection, %{embeddings: embeddings, documents: documents, ids: ids}) do
    with {:ok, %{status: 200}} <-
           Qdrant.upsert_point(collection.name, %{
             batch: %{
               ids: ids,
               vectors: embeddings,
               payloads: documents
             }
           }) do
      :ok
    else
      {:error, %{status: status}} -> {:error, status}
    end
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def delete_all_with_metadata(collection, metadata) do
    filter = %{
      must:
        metadata
        |> Enum.map(fn {key, value} -> %{key: "metadata.#{key}", match: %{value: value}} end)
    }

    with {:ok, %{status: 200}} <-
           Qdrant.Api.Http.Points.delete_points(collection.name, %{filter: filter}) do
      :ok
    else
      {:error, %{status: status}} -> {:error, status}
    end
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def query(collection, %{query_embeddings: query_embeddings, limit: limit}) do
    with {:ok, %{status: 200, body: body}} <-
           Qdrant.search_points(collection.name, %{
             vector: query_embeddings,
             limit: limit,
             with_payload: true
           }) do
      {:ok,
       body
       |> get_in(["result"])
       |> Enum.map(& &1["payload"])}
    else
      {:error, %{status: status}} -> {:error, status}
    end
  end
end

defmodule Buildel.VectorDB.EctoAdapter.Chunk do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, Ecto.UUID, autogenerate: true}

  schema "vector_collection_chunks" do
    field :collection_name, :string
    field :embedding_1536, Pgvector.Ecto.Vector
    field :embedding_384, Pgvector.Ecto.Vector
    field :document, :string
    field :metadata, :map
    field :similarity, :float, virtual: true

    timestamps()
  end

  def changeset(chunk, attrs) do
    chunk
    |> cast(attrs, [:id, :collection_name, :embedding_1536, :embedding_384, :document, :metadata])
    |> validate_required([:collection_name, :embedding_1536, :embedding_384, :document, :metadata])
    |> unique_constraint(:id)
  end
end

defmodule Buildel.VectorDB.EctoAdapter do
  @behaviour Buildel.VectorDB.VectorDBAdapterBehaviour

  alias Buildel.VectorDB.EctoAdapter.Chunk

  import Ecto.Query
  import Pgvector.Ecto.Query

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def add(collection, %{embeddings: embeddings, documents: documents, ids: ids}) do
    time = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    chunks =
      Enum.zip([ids, embeddings, documents])
      |> Enum.map(fn {id, embedding, document} ->
        embedding_1536 = if Enum.count(embedding) == 1536, do: embedding, else: nil
        embedding_384 = if Enum.count(embedding) == 384, do: embedding, else: nil

        %{
          id: id,
          collection_name: collection.name,
          embedding_1536: embedding_1536,
          embedding_384: embedding_384,
          document: document.document,
          metadata: document.metadata,
          inserted_at: time,
          updated_at: time
        }
      end)

    {_inserted_records, nil} = Buildel.Repo.insert_all(Chunk, chunks)
    :ok
  end

  def get_all(collection, metadata, _params) do
    Buildel.Repo.all(
      from c in Chunk,
        where: c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata)
    )
    |> Enum.map(fn chunk ->
      %{
        "document" => chunk.document,
        "metadata" => chunk.metadata
      }
    end)
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def delete_all_with_metadata(collection, metadata) do
    Buildel.Repo.delete_all(
      from c in Chunk,
        where: c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata)
    )

    :ok
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def query(collection, %{
        query_embeddings: query_embeddings,
        limit: limit,
        similarity_treshhold: similarity_treshhold
      }) do
    embedding_size = Enum.count(query_embeddings)
    embedding_column = "embedding_#{embedding_size}" |> String.to_atom()

    results =
      Buildel.Repo.all(
        from c in Chunk,
          where: c.collection_name == ^collection.name,
          order_by: cosine_distance(field(c, ^embedding_column), ^query_embeddings),
          limit: ^limit,
          select: %{
            c
            | similarity: 1 - cosine_distance(field(c, ^embedding_column), ^query_embeddings)
          }
      )
      |> Enum.filter(&(&1.similarity > similarity_treshhold))
      |> Enum.map(fn chunk ->
        %{
          "document" => chunk.document,
          "metadata" => chunk.metadata
        }
      end)

    {:ok, results}
  end
end
