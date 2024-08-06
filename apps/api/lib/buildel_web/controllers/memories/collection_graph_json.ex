defmodule BuildelWeb.CollectionGraphJSON do
  def show(%{matrix: matrix}) do
    %{data: data(matrix)}
  end

  defp data(matrix) do
    %{
      nodes: Map.keys(matrix),
      links:
        Enum.flat_map(matrix, fn {node, edges} ->
          Enum.map(edges, fn {edge, weight} ->
            %{
              source: node,
              target: edge,
              similarity: weight
            }
          end)
        end)
    }
  end
end
