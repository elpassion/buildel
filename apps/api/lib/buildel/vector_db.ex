defmodule Buildel.VectorDB do
  def init(collection_name) do
    with {:ok, _collection} <-
           adapter().create_collection(collection_name, embeddings().collection_config()) do
      {:ok, %{name: collection_name}}
    else
      {:error, error} -> {:error, error}
    end
  end

  def add(collection_name, text, metadata: metadata, api_key: api_key) do
    documents =
      Buildel.Splitters.recursive_character_text_split(text, %{
        chunk_size: 1000,
        chunk_overlap: 200
      })

    {:ok, embeddings_list} =
      embeddings().get_embeddings(inputs: documents, api_key: api_key)

    {:ok, collection} = adapter().get_collection(collection_name)

    adapter().add(collection, %{
      embeddings: embeddings_list,
      documents:
        documents |> Enum.map(fn document -> %{document: document, metadata: metadata} end),
      ids: Enum.map(1..Enum.count(documents), fn _ -> UUID.uuid4() end)
    })

    {:ok, collection}
  end

  def query(collection_name, query, api_key: api_key) do
    {:ok, embeddings_list} = embeddings().get_embeddings(inputs: [query], api_key: api_key)

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
    Application.get_env(:bound, :vector_db, Buildel.VectorDB.QdrantAdapter)
  end

  defp embeddings do
    Application.get_env(:bound, :embeddings, Buildel.Clients.OpenAIEmbeddings)
  end
end

defmodule Buildel.VectorDB.VectorDBAdapter do
  @callback get_collection(String.t()) :: {:ok, map()}
  @callback create_collection(String.t(), map()) :: {:ok, map()}
  @callback delete_all_with_metadata(map(), map()) :: :ok
  @callback add(map(), map()) :: :ok
end

defmodule Buildel.VectorDB.QdrantAdapter do
  @behaviour Buildel.VectorDB.VectorDBAdapter

  @impl Buildel.VectorDB.VectorDBAdapter
  def get_collection(collection_name) do
    {:ok, _} = Qdrant.collection_info(collection_name)

    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapter
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

  @impl Buildel.VectorDB.VectorDBAdapter
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

  @impl Buildel.VectorDB.VectorDBAdapter
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
       |> Enum.map(fn %{"payload" => %{"document" => document, "metadata" => %{ "file_name" => filename }}} -> "File: #{filename}\n\n#{document |> String.trim()}" end)}
    else
      {:error, %{status: status}} -> {:error, status}
    end
  end

  def list(collection) do
    Qdrant.Api.Http.Points.scroll_points(collection.name, %{})
  end
end
