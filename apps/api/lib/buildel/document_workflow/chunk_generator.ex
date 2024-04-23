defmodule Buildel.DocumentWorkflow.ChunkGenerator do
  alias Buildel.DocumentWorkflow.DocumentProcessor

  defmodule Chunk do
    alias __MODULE__

    @type chunk_metadata :: %{
            building_block_ids: [binary()],
            keywords: [binary()],
            prev: integer(),
            next: integer()
          }

    @type t :: %Chunk{
            id: binary(),
            value: binary(),
            embeddings: [float()],
            metadata: chunk_metadata()
          }
    defstruct [:id, :value, :embeddings, :metadata]
  end

  @chunk_size 1000
  @chunk_overlap 0

  @type chunk_config :: %{
          chunk_size: integer(),
          chunk_overlap: integer()
        }
  @type struct_list :: [
          DocumentProcessor.Header.t()
          | DocumentProcessor.Paragraph.t()
          | DocumentProcessor.ListItem.t()
        ]
  @spec split_into_chunks(struct_list(), chunk_config()) :: [Chunk.t()]
  def split_into_chunks(list, config \\ %{}) do
    merged_config = Map.merge(%{chunk_size: @chunk_size, chunk_overlap: @chunk_overlap}, config)
    splitter(list, "", [], %{}, merged_config)
  end

  @spec add_neighbors([Chunk.t()]) :: [Chunk.t()]
  def add_neighbors(list) do
    {list_with_prev, _, next_map} =
      list
      |> Enum.reduce({[], nil, %{}}, fn elem, {acc, prev_id, next_map} ->
        updated_elem = Map.put(elem, :metadata, Map.merge(elem.metadata, %{prev: prev_id}))

        updated_next_map = Map.put(next_map, prev_id, elem.id)

        {[updated_elem | acc], Map.get(elem, :id), updated_next_map}
      end)

    list_with_prev
    |> Enum.reverse()
    |> Enum.map(fn elem ->
      next_id = Map.get(next_map, elem.id)
      Map.put(elem, :metadata, Map.merge(elem.metadata, %{next: next_id}))
    end)
  end

  defp splitter([], text, chunk_list, metadata, _config) do
    chunk_list ++ [create_chunk(text, metadata)]
  end

  defp splitter(list, text, chunk_list, metadata, config) do
    if String.length(text) < config.chunk_size do
      [head | tail] = list

      new_metadata =
        Map.update(metadata, :building_block_ids, [head.id], &(&1 ++ [head.id]))
        |> Map.update(:keywords, head.metadata.headers, &Enum.uniq(&1 ++ head.metadata.headers))

      splitter(
        tail,
        text <> " " <> head.value,
        chunk_list,
        new_metadata,
        config
      )
    else
      overlap_length = config.chunk_overlap

      list =
        if overlap_length > 0 do
          overlap_text = String.slice(text, -overlap_length..-1)

          {_, new_overlap_list} = String.split(overlap_text, " ") |> List.pop_at(0)

          if Enum.empty?(new_overlap_list) do
            list
          else
            new_overlap_text = Enum.join(new_overlap_list, " ")

            [first_element | rest_of_list] = list

            modified_first_element =
              Map.put(first_element, :value, new_overlap_text <> " " <> first_element.value)

            [modified_first_element | rest_of_list]
          end
        else
          list
        end

      new_chunk_list = chunk_list ++ [create_chunk(text, metadata)]
      splitter(list, "", new_chunk_list, %{}, config)
    end
  end

  defp create_chunk(text, metadata) do
    %Chunk{id: UUID.uuid4(), value: text, metadata: metadata}
  end
end
