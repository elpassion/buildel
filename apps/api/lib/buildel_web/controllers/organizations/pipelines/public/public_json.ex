defmodule BuildelWeb.OrganizationPipelinePublicJSON do
  alias Buildel.Pipelines.Pipeline

  def show(%{pipeline: pipeline}) do
    %{data: data(pipeline)}
  end

  defp data(%Pipeline{} = pipeline) do
    %{
      id: pipeline.id,
      name: pipeline.name,
      organization_id: pipeline.organization_id,
      interface_config: pipeline.interface_config
    }
  end
end
