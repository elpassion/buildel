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

  def show(conn, %{"organization_id" => organization_id, "id" => id}) do
    organization = Organizations.get_organization!(organization_id)
    pipeline = Pipelines.get_organization_pipeline!(organization, id)
    render(conn, :show, pipeline: pipeline)
  end

  def create(conn, %{"organization_id" => organization_id, "pipeline" => pipeline_params}) do
    organization = Organizations.get_organization!(organization_id)

    with {:ok, %Pipeline{} = pipeline} <-
           Pipelines.create_pipeline(Map.put(pipeline_params, "organization_id", organization.id)) do
      conn
      |> put_status(:created)
      |> put_resp_header(
        "location",
        ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}"
      )
      |> render(:show, pipeline: pipeline)
    end
  end

  def delete(conn, %{"organization_id" => organization_id, "id" => id}) do
    organization = Organizations.get_organization!(organization_id)
    pipeline = Pipelines.get_organization_pipeline!(organization, id)

    with {:ok, %Pipeline{}} <- Pipelines.delete_pipeline(pipeline) do
      send_resp(conn, :no_content, "")
    end
  end
end
