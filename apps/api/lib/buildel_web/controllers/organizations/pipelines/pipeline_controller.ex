defmodule BuildelWeb.OrganizationPipelineController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, %{"organization_id" => organization_id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         pipelines <- Pipelines.list_organization_pipelines(organization) do
      render(conn, :index, pipelines: pipelines)
    end
  end

  def show(conn, %{"organization_id" => organization_id, "id" => id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         pipeline <- Pipelines.get_organization_pipeline!(organization, id) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  def create(conn, %{"organization_id" => organization_id, "pipeline" => pipeline_params}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
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

  def update(conn, %{
        "organization_id" => organization_id,
        "id" => id,
        "pipeline" => pipeline_params
      }) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         pipeline <- Pipelines.get_organization_pipeline!(organization, id),
         {:ok, %Pipeline{} = pipeline} <- Pipelines.update_pipeline(pipeline, pipeline_params) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  def delete(conn, %{"organization_id" => organization_id, "id" => id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         pipeline <- Pipelines.get_organization_pipeline!(organization, id),
         {:ok, %Pipeline{}} <- Pipelines.delete_pipeline(pipeline) do
      send_resp(conn, :no_content, "")
    end
  end
end
