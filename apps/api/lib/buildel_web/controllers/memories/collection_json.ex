defmodule BuildelWeb.CollectionJSON do
  alias Buildel.Memories.MemoryCollection

  def search(%{memory_chunks: memory_chunks}) do
    %{data: for(chunk <- memory_chunks, do: search_data(chunk))}
  end

  defp search_data(%{
         "chunk_id" => chunk_id,
         "document" => document,
         "similarity" => similarity,
         "metadata" => metadata
       }) do
    %{
      id: chunk_id,
      content: document,
      similarity: similarity,
      file_name: metadata["file_name"]
    }
  end

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
