defmodule Buildel.ClientMocks.VectorDB.QdrantAdapter do
  @behaviour Buildel.VectorDB.VectorDBAdapter

  @impl Buildel.VectorDB.VectorDBAdapter
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapter
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapter
  def add(_collection, %{embeddings: _embeddings, documents: _documents, ids: _ids}) do
    :ok
  end

  @impl Buildel.VectorDB.VectorDBAdapter
  def delete_all_with_metadata(_collection, _metadata) do
    :ok
  end
end
