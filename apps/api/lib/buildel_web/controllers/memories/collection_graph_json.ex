defmodule BuildelWeb.CollectionGraphJSON do
  def show(%{graph: graph}) do
    %{data: data(graph)}
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

  def data(graph) do
    %{
      nodes:
        Enum.map(graph, fn %{
                             embedding_reduced_2: embedding_reduced_2,
                             id: id,
                             document: document,
                             metadata: metadata
                           } ->
          %{
            id: id,
            memory_id: Map.get(metadata, "memory_id"),
            point: embedding_reduced_2,
            content: String.slice(document, 0, 50)
          }
        end)
    }
  end
end
