defmodule BuildelWeb.CollectionJSON do
  alias Buildel.Memories.MemoryCollection

  def search(%{
        memory_chunks: memory_chunks,
        total_tokens: total_tokens
      }) do
    %{
      data: for(chunk <- memory_chunks, do: search_data(chunk)),
      meta: %{
        total_tokens: total_tokens
      }
    }
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
      file_name: metadata["file_name"],
      keywords: metadata["keywords"] || [],
      pages: metadata["pages"] || []
    }
  end

  def index(%{collections: collections, params: params, total: total}) do
    params =
      case params do
        %{page: nil, per_page: nil} ->
          %Buildel.Memories.ListParams{page: 1, per_page: total}

        params ->
          params
      end

    %{data: for(collection <- collections, do: data(collection)), meta: %{total: total, page: params.page, per_page: params.per_page}}
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
        secret_name: collection.embeddings_secret_name,
        endpoint: collection.embeddings_endpoint
      },
      chunk_size: collection.chunk_size,
      chunk_overlap: collection.chunk_overlap
    }
  end
end
