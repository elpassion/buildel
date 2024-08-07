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
          :embeddings => Buildel.Clients.Embeddings.t()
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

  def add(%__MODULE__{adapter: adapter}, collection_name, documents) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.add(collection, documents)

    {:ok, collection}
  end

  deftimed query(
             %__MODULE__{adapter: adapter, embeddings: embeddings},
             collection_name,
             query,
             metadata,
             options
           ),
           [
             :buildel,
             :vector_db,
             :query
           ] do
    options = Map.merge(%{limit: 5, similarity_threshhold: 0}, options)

    with {:ok, %{embeddings: embeddings_list, embeddings_tokens: embeddings_tokens}} <-
           Embeddings.get_embeddings(embeddings, [query]),
         {:ok, collection} <- adapter.get_collection(collection_name),
         {:ok, results} <-
           adapter.query(collection, metadata, %{
             query_embeddings: embeddings_list |> List.first(),
             limit: options.limit,
             similarity_treshhold: options.similarity_threshhold
           }) do
      %{result: results, embeddings_tokens: embeddings_tokens}
    end
  end

  def get_by_parent_id(%__MODULE__{adapter: adapter}, collection_name, parent_id) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.get_by_parent_id(collection, parent_id)
  end

  def get_by_id(%__MODULE__{adapter: adapter}, collection_name, chunk_id) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.get_by_id(collection, chunk_id)
  end

  def get_all(%__MODULE__{adapter: adapter}, collection_name, metadata \\ %{}, params \\ %{}) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.get_all(collection, metadata, params)
  end

  def get_all_by_id(
        %__MODULE__{adapter: adapter},
        ids,
        _params \\ %{}
      ) do
    adapter.get_all_by_id(ids)
  end

  def get_relations(%__MODULE__{adapter: adapter}, collection_name) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.get_relations(collection)
  end

  def delete_all_with_metadata(%__MODULE__{adapter: adapter}, collection_name, metadata) do
    {:ok, collection} = adapter.get_collection(collection_name)

    adapter.delete_all_with_metadata(collection, metadata)
  end
end

defmodule Buildel.VectorDB.VectorDBAdapterBehaviour do
  @type t :: module()
  @callback get_collection(String.t()) :: {:ok, map()}
  @callback create_collection(String.t(), map()) :: {:ok, map()}
  @callback delete_all_with_metadata(map(), map()) :: :ok
  @callback add(map(), list(map())) :: :ok
  @callback query(map(), map(), map()) :: {:ok, list()}
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
  def add(collection, documents) do
    with {:ok, %{status: 200}} <-
           Qdrant.upsert_point(collection.name, %{
             batch: %{
               ids: documents |> Enum.map(&Map.get(&1, :id)),
               vectors: documents |> Enum.map(&Map.get(&1, :embeddings)),
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
  def query(collection, _metadata, %{query_embeddings: query_embeddings, limit: limit}) do
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
    field :embedding_3072, Pgvector.Ecto.Vector
    field :embedding_1536, Pgvector.Ecto.Vector
    field :embedding_384, Pgvector.Ecto.Vector
    field :embedding_reduced_2, Pgvector.Ecto.Vector
    field :document, :string
    field :metadata, :map
    field :similarity, :float, virtual: true

    timestamps()
  end

  def changeset(chunk, attrs) do
    chunk
    |> cast(attrs, [
      :id,
      :collection_name,
      :embedding_3072,
      :embedding_1536,
      :embedding_384,
      :document,
      :metadata
    ])
    |> validate_required([
      :collection_name,
      :embedding_3072,
      :embedding_1536,
      :embedding_384,
      :document,
      :metadata
    ])
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
  def add(collection, documents) do
    time = NaiveDateTime.utc_now() |> NaiveDateTime.truncate(:second)

    chunks =
      documents
      |> Enum.map(fn %{embeddings: embeddings, id: id, value: value} = document ->
        embedding_3072 = if Enum.count(embeddings) == 3072, do: embeddings, else: nil
        embedding_1536 = if Enum.count(embeddings) == 1536, do: embeddings, else: nil
        embedding_384 = if Enum.count(embeddings) == 384, do: embeddings, else: nil

        %{
          id: id,
          collection_name: collection.name,
          embedding_3072: embedding_3072,
          embedding_1536: embedding_1536,
          embedding_384: embedding_384,
          document: value,
          metadata: document.metadata,
          inserted_at: time,
          updated_at: time
        }
      end)

    {_inserted_records, nil} = Buildel.Repo.insert_all(Chunk, chunks)
    :ok
  end

  def get_by_parent_id(collection, parent_id) do
    Buildel.Repo.all(
      from c in Chunk,
        where:
          (c.collection_name == ^collection.name and
             fragment("metadata->>'parent' = ?", ^parent_id)) or
            c.id == ^parent_id,
        order_by: fragment("metadata->>'index' ASC")
    )
    |> Enum.map(fn chunk ->
      %{
        "document" => chunk.document,
        "metadata" => chunk.metadata,
        "chunk_id" => chunk.id,
        "similarity" => chunk.similarity
      }
    end)
  end

  def get_by_id(collection, chunk_id) do
    chunk =
      Buildel.Repo.one!(
        from c in Chunk,
          where:
            c.collection_name == ^collection.name and
              c.id == ^chunk_id,
          order_by: fragment("metadata->>'index' ASC")
      )

    embedding_column =
      Map.keys(chunk)
      |> Enum.filter(fn key -> String.starts_with?(to_string(key), "embedding_") end)
      |> Enum.filter(fn key -> chunk |> Map.get(key) |> is_struct(Pgvector) end)
      |> List.first()

    %{
      "document" => chunk.document,
      "metadata" => chunk.metadata,
      "chunk_id" => chunk.id,
      "embedding" => chunk |> Map.get(embedding_column)
    }
  end

  def get_all(collection, metadata, _params) do
    Buildel.Repo.all(
      from c in Chunk,
        where:
          c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata),
        order_by: fragment("metadata->>'index' ASC"),
        select: %{
          c
          | embedding_1536: nil,
            embedding_3072: nil
        }
    )
    |> Enum.map(fn chunk ->
      %{
        "document" => chunk.document,
        "metadata" => chunk.metadata,
        "chunk_id" => chunk.id,
        "similarity" => 0.0
      }
    end)
  end

  def get_all_by_id(ids) do
    Buildel.Repo.all(
      from c in Chunk,
        where: c.id in ^ids,
        order_by: fragment("metadata->>'index' ASC"),
        select: %{
          c
          | embedding_1536: nil,
            embedding_3072: nil
        }
    )
    |> Enum.map(fn chunk ->
      %{
        "document" => chunk.document,
        "metadata" => chunk.metadata,
        "chunk_id" => chunk.id,
        "similarity" => 0.0
      }
    end)
  end

  def get_relations(collection) do
    Buildel.Repo.all(
      from c1 in Chunk,
        join: c2 in Chunk,
        on: c1.id < c2.id,
        select:
          {c1.id, c2.id, fragment("?::halfvec(3072) <-> ?", c1.embedding_3072, c2.embedding_3072)},
        where: c1.collection_name == ^collection.name and c2.collection_name == ^collection.name
    )
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
  def query(collection, metadata, %{
        query_embeddings: query_embeddings,
        limit: limit,
        similarity_treshhold: _similarity_treshhold
      }) do
    embedding_size = Enum.count(query_embeddings)
    embedding_column = "embedding_#{embedding_size}" |> String.to_atom()

    embeddings_query =
      if supports_halfvec?() && embedding_size == 3072,
        do:
          from(c in Chunk,
            where:
              c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata),
            order_by:
              fragment(
                "?::halfvec(3072) <-> ?",
                field(c, ^embedding_column),
                ^query_embeddings
              ),
            limit: ^limit,
            select: %{
              c
              | similarity: l2_distance(field(c, ^embedding_column), ^query_embeddings),
                embedding_1536: nil,
                embedding_3072: nil
            }
          ),
        else:
          from(c in Chunk,
            where:
              c.collection_name == ^collection.name and fragment("? @> ?", c.metadata, ^metadata),
            order_by:
              fragment(
                "? <-> ?",
                field(c, ^embedding_column),
                ^query_embeddings
              ),
            limit: ^limit,
            select: %{
              c
              | similarity: l2_distance(field(c, ^embedding_column), ^query_embeddings),
                embedding_1536: nil,
                embedding_3072: nil
            }
          )

    results =
      Buildel.Repo.all(embeddings_query)
      # |> Enum.filter(&(&1.similarity > similarity_treshhold))
      |> Enum.map(fn chunk ->
        %{
          "document" => chunk.document,
          "metadata" => chunk.metadata,
          "chunk_id" => chunk.id,
          "similarity" => chunk.similarity
        }
      end)

    {:ok, results}
  end

  def supports_halfvec?(repo \\ Buildel.Repo) do
    case extension_version(repo) do
      nil ->
        false

      version when is_binary(version) ->
        [major, minor | _] = String.split(version, ".")
        major = String.to_integer(major)
        minor = String.to_integer(minor)
        if major * 10 + minor >= 7, do: true, else: false
    end
  end

  defp extension_version(repo) do
    case repo.one(
           from e in "pg_available_extensions",
             where: e.name == "vector",
             select: e.installed_version
         ) do
      version when is_binary(version) ->
        version

      _ ->
        nil
    end
  end
end
