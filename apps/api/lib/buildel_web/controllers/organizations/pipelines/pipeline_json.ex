defmodule BuildelWeb.OrganizationPipelineJSON do
  alias Buildel.Pipelines.Pipeline

  def index(%{pipelines: pipelines}) do
    %{data: for(pipeline <- pipelines, do: data(pipeline))}
  end

  def show(%{pipeline: pipeline}) do
    %{data: data(pipeline)}
  end

  def details(%{total_cost: total_cost}) do
    %{
      data: %{
        total_cost: total_cost
      }
    }
  end

  defp data(%Pipeline{} = pipeline) do
    %{
      id: pipeline.id,
      name: pipeline.name,
      budget_limit: pipeline.budget_limit,
      logs_enabled: pipeline.logs_enabled,
      organization_id: pipeline.organization_id,
      interface_config: pipeline.interface_config,
      runs_count: pipeline.runs_count,
      config:
        Map.update(pipeline.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            case Buildel.Blocks.type(block["type"]) do
              nil -> nil
              _type -> block |> Map.delete("block_type")
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
