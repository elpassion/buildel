defmodule BuildelWeb.OrganizationPipelineAliasController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.{Alias, Pipeline}

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, aliases} <- Pipelines.get_pipeline_aliases(pipeline) do
      render(conn, :index, aliases: aliases)
    end
  end

  def show(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, pipeline_alias} <- Pipelines.get_pipeline_alias(pipeline, id) do
      render(conn, :show, alias: pipeline_alias)
    end
  end

  defparams(:create) do
    required(:alias, :map) do
      required(:name, :string)
      required(:config, :map)
      required(:interface_config, :map)
    end
  end

  def create(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{alias: alias_config}} <-
           validate(:create, params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Alias{} = alias} <-
           Pipelines.create_alias(alias_config |> Map.put(:pipeline_id, pipeline_id)) do
      conn
      |> put_status(:created)
      |> render(:show, alias: alias)
    end
  end

  defparams(:update) do
    required(:alias, :map) do
      optional(:name, :string)
      optional(:config, :map)
      optional(:interface_config, :map)
    end
  end

  def update(
        conn,
        %{"organization_id" => organization_id, "pipeline_id" => pipeline_id, "id" => id} = params
      ) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, alias} <- Pipelines.get_pipeline_alias(pipeline, id),
         {:ok, %{alias: alias_config}} <- validate(:update, params),
         {:ok, alias} <- Pipelines.update_alias(alias, alias_config) do
      conn
      |> put_status(:ok)
      |> render(:show, alias: alias)
    end
  end

  def delete(conn, %{
        "organization_id" => organization_id,
        "pipeline_id" => pipeline_id,
        "id" => id
      }) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, alias} <- Pipelines.get_pipeline_alias(pipeline, id),
         {:ok, _} <- Pipelines.delete_alias(alias) do
      conn |> put_status(:no_content) |> json(%{})
    end
  end
end
