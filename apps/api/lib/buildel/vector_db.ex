defmodule Buildel.VectorDB do
  alias Buildel.Utils.TelemetryWrapper
  use TelemetryWrapper

  def init(collection_name) do
    with {:ok, _collection} <-
           adapter().create_collection(collection_name, embeddings().collection_config()) do
      {:ok, %{name: collection_name}}
    else
      {:error, error} -> {:error, error}
    end
  end

  def add(collection_name, documents, api_key: api_key) do
    inputs = documents |> Enum.map(&Map.get(&1, :document))

    ids =
      documents
      |> Enum.map(&get_in(&1, [:metadata, :chunk_id]))

    {:ok, embeddings_list} =
      embeddings().get_embeddings(
        inputs: inputs,
        api_key: api_key
      )

    {:ok, collection} = adapter().get_collection(collection_name)

    adapter().add(collection, %{
      embeddings: embeddings_list,
      documents: documents,
      ids: ids
    })

    {:ok, collection}
  end

  deftimed query(collection_name, query, api_key: api_key), [:buildel, :vector_db, :query] do
    {:ok, embeddings_list} =
      case Buildel.DocumentCache.get("embeddings::#{query}") do
        nil ->
          Buildel.DocumentCache.put(
            "embeddings::#{query}",
            embeddings().get_embeddings(inputs: [query], api_key: api_key)
          )

        res ->
          res
      end

    {:ok, collection} = adapter().get_collection(collection_name)

    {:ok, results} =
      adapter().query(collection, %{
        query_embeddings: embeddings_list |> List.first()
      })

    results
  end

  def delete_all_with_metadata(collection_name, metadata) do
    {:ok, collection} = adapter().get_collection(collection_name)

    adapter().delete_all_with_metadata(collection, metadata)
  end

  defp adapter do
    Application.fetch_env!(:buildel, :vector_db)
  end

  defp embeddings do
    Application.fetch_env!(:buildel, :embeddings)
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
  def query(collection, %{query_embeddings: query_embeddings}) do
    with {:ok, %{status: 200, body: body}} <-
           Qdrant.search_points(collection.name, %{
             vector: query_embeddings,
             limit: 5,
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
    chunks = Enum.zip([ids, embeddings, documents])
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

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def delete_all_with_metadata(collection, metadata) do
    Buildel.Repo.delete_all(
      from c in Chunk,
      where: c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata)
    )
    :ok
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def query(collection, %{query_embeddings: query_embeddings}) do
    embedding_size = Enum.count(query_embeddings)
    embedding_column = "embedding_#{embedding_size}" |> String.to_atom()

    results = Buildel.Repo.all(
      from c in Chunk,
        where: c.collection_name == ^collection.name,
        order_by: cosine_distance(field(c, ^embedding_column), ^query_embeddings),
        limit: 5
    ) |> Enum.map(fn chunk ->
      %{
        "document" => chunk.document,
        "metadata" => chunk.metadata
      }
    end)
    {:ok, results}
  end
end
