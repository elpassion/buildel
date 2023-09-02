defmodule Buildel.VectorDB do
  def init(collection_name) do
    {:ok, _collection} = Buildel.VectorDB.QdrantAdapter.create_collection(collection_name)
  end

  def add_text(collection_name, text) do
    documents =
      Buildel.Splitters.recursive_character_text_split(text, %{
        chunk_size: 1000,
        chunk_overlap: 200
      })

    {:ok, %{data: gpt_embeddings}} = Buildel.Clients.ChatGPT.get_embeddings(inputs: documents)
    embeddings = gpt_embeddings |> Enum.map(fn %{"embedding" => embedding} -> embedding end)

    {:ok, collection} = Buildel.VectorDB.QdrantAdapter.get_collection(collection_name)

    Buildel.VectorDB.QdrantAdapter.add(collection, %{
      embeddings: embeddings,
      documents: documents,
      ids: Enum.map(1..Enum.count(documents), fn _ -> UUID.uuid4() end)
    })

    {:ok, collection}
  end

  def query(collection_name, query) do
    documents = Buildel.Splitters.recursive_character_text_split(query, %{})
    {:ok, %{data: gpt_embeddings}} = Buildel.Clients.ChatGPT.get_embeddings(inputs: documents)
    embeddings = gpt_embeddings |> Enum.map(fn %{"embedding" => embedding} -> embedding end)
    {:ok, collection} = Buildel.VectorDB.QdrantAdapter.get_collection(collection_name)

    {:ok, results} =
      Buildel.VectorDB.QdrantAdapter.query(collection, %{
        query_embeddings: embeddings |> Enum.at(0)
      })

    results
  end

  def adapter do
  end
end

defmodule Buildel.VectorDB.QdrantAdapter do
  def get_collection(collection_name) do
    {:ok, _} = Qdrant.collection_info(collection_name)

    {:ok, %{name: collection_name}}
  end

  def create_collection(collection_name) do
    {:ok, _} =
      Qdrant.create_collection(collection_name, %{vectors: %{size: 1536, distance: "Cosine"}})

    {:ok, %{name: collection_name}}
  end

  def add(collection, %{embeddings: embeddings, documents: documents, ids: ids}) do
    with {:ok, %{status: 200}} <-
           Qdrant.upsert_point(collection.name, %{
             batch: %{
               ids: ids,
               vectors: embeddings,
               payloads: documents |> Enum.map(fn document -> %{document: document} end)
             }
           }) do
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
       |> Enum.map(fn %{"payload" => %{"document" => document}} -> document end)}
    else
      {:error, %{status: status}} -> {:error, status}
    end
  end

  def list(collection) do
    res = Qdrant.Api.Http.Points.scroll_points(collection.name, %{})
  end
end
