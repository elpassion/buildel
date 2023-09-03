defmodule BuildelWeb.OrganizationPipelineController do
  use BuildelWeb, :controller

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  def index(conn, %{"organization_id" => organization_id}) do
    organization = Organizations.get_organization!(organization_id)
    pipelines = Pipelines.list_organization_pipelines(organization)
    render(conn, :index, pipelines: pipelines)
  end

  def delete(conn, %{"id" => id}) do
    organization = Organizations.get_organization!(id)
    pipeline = Pipelines.get_organization_pipeline!(organization, id)

    with {:ok, %Pipeline{}} <- Pipelines.delete_pipeline(pipeline) do
      send_resp(conn, :no_content, "")
    end
  end
end
