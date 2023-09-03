defmodule BuildelWeb.OrganizationPipelineController do
  use BuildelWeb, :controller

  alias Buildel.Pipelines
  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  def index(conn, %{"organization_id" => organization_id}) do
    organization = Organizations.get_organization!(organization_id)
    pipelines = Pipelines.list_organization_pipelines(organization)
    render(conn, :index, pipelines: pipelines)
  end
end
