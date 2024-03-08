defmodule Buildel.DocumentWorkflow.ChunkGenerator do
  alias Buildel.DocumentWorkflow.DocumentProcessor

  defmodule Chunk do
    alias __MODULE__

    @type t :: %Chunk{
            id: binary(),
            value: binary(),
            keywords: [binary()],
            embeddings: [float()],
            prev: integer(),
            next: integer()
          }
    defstruct [:id, :value, :keywords, :embeddings, prev: nil, next: nil]
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

  @spec add_neighbors([Chunk.t()]) :: [Chunk.t()]
  def add_neighbors(list) do
    {list_with_prev, _, next_map} =
      list
      |> Enum.reduce({[], nil, %{}}, fn elem, {acc, prev_id, next_map} ->
        updated_elem = Map.put(elem, :prev, prev_id)

        updated_next_map = Map.put(next_map, prev_id, elem.id)

        {[updated_elem | acc], Map.get(elem, :id), updated_next_map}
      end)

    list_with_prev
    |> Enum.reverse()
    |> Enum.map(fn elem ->
      next_id = Map.get(next_map, elem.id)
      Map.put(elem, :next, next_id)
    end)
  end

  defp splitter([], chunk, chunk_list, keywords, _config) do
    chunk_list ++ [create_chunk(chunk, Enum.uniq(keywords))]
  end

  defp splitter(list, chunk, chunk_list, keywords, config) do
    if String.length(chunk) < config.chunk_size do
      [head | tail] = list

      splitter(
        tail,
        chunk <> " " <> head.value,
        chunk_list,
        keywords ++ head.metadata.headers,
        config
      )
    else
      new_chunk_list = chunk_list ++ [create_chunk(chunk, Enum.uniq(keywords))]
      splitter(list, "", new_chunk_list, [], config)
    end
  end

  defp create_chunk(text, keywords) do
    %Chunk{id: UUID.uuid4(), value: text, keywords: keywords}
  end
end
