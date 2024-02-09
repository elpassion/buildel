defmodule BuildelWeb.OrganizationPipelineJSON do
  alias Buildel.Pipelines.Pipeline

  def index(%{pipelines: pipelines}) do
    %{data: for(pipeline <- pipelines, do: data(pipeline))}
  end

  def show(%{pipeline: pipeline}) do
    %{data: data(pipeline)}
  end

  defp data(%Pipeline{} = pipeline) do
    %{
      id: pipeline.id,
      name: pipeline.name,
      organization_id: pipeline.organization_id,
      interface_config: pipeline.interface_config,
      runs_count: pipeline.runs_count,
      config:
        Map.update(pipeline.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            case Buildel.Blocks.type(block["type"]) do
              nil ->
                nil

              type ->
                Map.put(
                  block,
                  "block_type",
                  type.options
                ) |> Map.delete("block_type")
            end
          end)
          |> Enum.filter(fn
            nil -> false
            _ -> true
          end)
        end)
    }
  end
end
