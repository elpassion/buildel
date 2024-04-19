defmodule BuildelWeb.CollectionJSON do
  alias Buildel.Memories.MemoryCollection

  def index(%{collections: collections}) do
    %{data: for(collection <- collections, do: data(collection))}
  end

  def show(%{collection: collection}) do
    %{data: data(collection)}
  end

  defp data(%MemoryCollection{} = collection) do
    %{
      id: collection.id,
      name: collection.collection_name,
      embeddings: %{
        api_type: collection.embeddings_api_type,
        model: collection.embeddings_model,
        secret_name: collection.embeddings_secret_name
      },
      chunk_size: collection.chunk_size,
      chunk_overlap: collection.chunk_overlap
    }
  end
end
