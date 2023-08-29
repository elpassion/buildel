defmodule Buildel.VectorDB do
  def init(collection_name) do
    {:ok, _collection} = Chroma.Collection.create(collection_name, %{"type" => "test"})
  end

  def add_text(collection_name, text) do
    documents =
      Buildel.Splitters.recursive_character_text_split(text, %{
        chunk_size: 1000,
        chunk_overlap: 200
      })

    {:ok, %{data: gpt_embeddings}} = Buildel.Clients.ChatGPT.get_embeddings(inputs: documents)
    embeddings = gpt_embeddings |> Enum.map(fn %{"embedding" => embedding} -> embedding end)

    {:ok, collection} = Chroma.Collection.get(collection_name)

    Chroma.Collection.add(collection, %{
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
    {:ok, collection} = Chroma.Collection.get(collection_name)
    {:ok, results} = Chroma.Collection.query(collection, %{query_embeddings: embeddings})
    results
  end
end
