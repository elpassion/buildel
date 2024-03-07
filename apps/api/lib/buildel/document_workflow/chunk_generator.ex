defmodule Buildel.DocumentWorkflow.ChunkGenerator do
  alias Buildel.DocumentWorkflow.DocumentProcessor

  defmodule Chunk do
    alias __MODULE__

    @type t :: %Chunk{
            id: binary(),
            value: binary(),
            keyword: binary(),
            embeddings: [float()]
          }
    defstruct [:id, :value, :keyword, :embeddings]
  end

  @chunk_size 1000

  @type chunk_config :: %{
          chunk_size: integer()
        }
  @type struct_list :: [
          DocumentProcessor.Header.t()
          | DocumentProcessor.Paragraph.t()
          | DocumentProcessor.ListItem.t()
        ]
  @spec split_into_chunks(struct_list(), chunk_config()) :: [Chunk.t()]
  def split_into_chunks(list, config \\ %{}) do
    merged_config = Map.merge(%{chunk_size: @chunk_size}, config)
    splitter(list, "", [], [], merged_config)
  end

  defp splitter([], chunk, chunks, deepest_header, _config) do
    keyword = Enum.join(deepest_header, " # ")
    chunks ++ [create_chunk(chunk, keyword)]
  end

  defp splitter(list, chunk, chunks, deepest_header, config) do
    if String.length(chunk) < config.chunk_size do
      [head | tail] = list

      if length(head.metadata.headers) > length(deepest_header) do
        splitter(tail, chunk <> " " <> head.value, chunks, head.metadata.headers, config)
      else
        splitter(tail, chunk <> " " <> head.value, chunks, deepest_header, config)
      end
    else
      # add headers meta at the beginning of the chunk
      keyword = Enum.join(deepest_header, " # ")
      new_chunk_list = chunks ++ [create_chunk(chunk, keyword)]
      splitter(list, "", new_chunk_list, [], config)
    end
  end

  defp create_chunk(text, keyword) do
    %Chunk{id: UUID.uuid4(), value: text, keyword: keyword}
  end
end
