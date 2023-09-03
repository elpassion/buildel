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
      config:
        Map.update(pipeline.config, "blocks", [], fn blocks ->
          Enum.map(blocks, fn block ->
            Map.put(block, "block_type", Buildel.Blocks.type(block["type"]).options)
          end)
        end)
    }
  end
end
