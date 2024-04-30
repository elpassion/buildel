defmodule Buildel.ClientMocks.VectorDB.EctoAdapter do
  @behaviour Buildel.VectorDB.VectorDBAdapterBehaviour

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def get_collection(collection_name) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def create_collection(collection_name, _opts \\ %{}) do
    {:ok, %{name: collection_name}}
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def add(_collection, %{embeddings: _embeddings, documents: _documents, ids: _ids}) do
    :ok
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def query(collection, metadata, params) do
    if function = Application.get_env(:buildel, :vectordb_mock_query_hook) do
      function.(collection, metadata, params)
    else
      {:ok, []}
    end
  end

  def get_by_parent_id(collection, parent_id) do
    if function = Application.get_env(:buildel, :vectordb_mock_get_by_parent_hook) do
      function.(collection, parent_id)
    else
      []
    end
  end

  def get_all(collection, metadata, params) do
    if function = Application.get_env(:buildel, :vectordb_mock_get_all_hook) do
      function.(collection, metadata, params)
    else
      []
    end
  end

  @impl Buildel.VectorDB.VectorDBAdapterBehaviour
  def delete_all_with_metadata(_collection, _metadata) do
    :ok
  end
end
