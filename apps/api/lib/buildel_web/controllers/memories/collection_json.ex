defmodule BuildelWeb.CollectionJSON do
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Memories.MemoryCollectionSearch

  def search(%{
        memory_chunks: memory_chunks,
        params: %MemoryCollectionSearch.Params{} = params
      }) do
    tokenizer = Buildel.Langchain.ChatGptTokenizer.init(%{})

    case params.token_limit do
      nil ->
        total = Enum.map_join(memory_chunks, " ", & &1["document"])
        total_tokens = tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(total)

        %{
          data: for(chunk <- memory_chunks, do: search_data(chunk)),
          meta: %{
            total_tokens: total_tokens
          }
        }

      token_limit ->
        {list, total} =
          memory_chunks
          |> Enum.reduce_while({[], ""}, fn chunk, {list, total} ->
            new_total = total <> " " <> chunk["document"]

            total_tokens =
              tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(new_total)

            if total_tokens > token_limit do
              {:halt, {list, total}}
            else
              {:cont, {[chunk | list], new_total}}
            end
          end)

        reversed = Enum.reverse(list)
        total_tokens = tokenizer |> Buildel.Langchain.ChatGptTokenizer.count_text_tokens(total)

        %{
          data: for(chunk <- reversed, do: search_data(chunk)),
          meta: %{
            total_tokens: total_tokens
          }
        }
    end
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
