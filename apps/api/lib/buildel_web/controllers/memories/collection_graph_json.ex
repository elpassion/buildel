defmodule BuildelWeb.CollectionGraphJSON do
  def show(%{graph: graph}) do
    %{data: data(graph)}
  end

  def details(%{chunk: chunk}) do
    %{
      data: %{
        id: chunk.id,
        memory_id: Map.get(chunk.metadata, "memory_id"),
        point: chunk.point,
        content: chunk.document,
        next: Map.get(chunk.metadata, "next"),
        prev: Map.get(chunk.metadata, "prev"),
        file_name: Map.get(chunk.metadata, "file_name"),
        keywords: Map.get(chunk.metadata, "keywords")
      }
    }
  end

  def state(%{state: state}) do
    %{
      data: %{
        state:
          case state do
            nil -> :idle
            _ -> :processing
          end
      }
    }
  end

  def related(%{chunks: chunks}) do
    %{
      data: %{
        chunks: Enum.map(chunks, &Map.get(&1, "chunk_id"))
      }
    }
  end

  def data(graph) do
    %{
      nodes:
        Enum.map(graph, fn %{
                             point: point,
                             id: id,
                             metadata: metadata
                           } ->
          %{
            id: id,
            memory_id: Map.get(metadata, "memory_id"),
            point: point
          }
        end)
    }
  end
end
