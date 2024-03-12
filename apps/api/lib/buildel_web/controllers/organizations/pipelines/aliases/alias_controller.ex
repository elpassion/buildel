defmodule BuildelWeb.OrganizationPipelineAliasController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.{Alias, Pipeline}

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["alias"]

  operation :index,
    summary: "List pipeline aliases",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Aliases.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, aliases} <- Pipelines.get_pipeline_aliases(pipeline) do
      render(conn, :index, aliases: aliases)
    end
  end

  operation :show,
    summary: "Show pipeline alias",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Alias ID", type: :string, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Aliases.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, pipeline_alias} <- Pipelines.get_pipeline_alias(pipeline, id) do
      render(conn, :show, alias: pipeline_alias)
    end
  end

  operation :create,
    summary: "Create pipeline alias",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: {"Alias", "application/json", BuildelWeb.Schemas.Aliases.CreateRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Aliases.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{alias: alias_config} = conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Alias{} = alias} <-
           Pipelines.create_alias(alias_config |> Map.put(:pipeline_id, pipeline_id)) do
      conn
      |> put_status(:created)
      |> render(:show, alias: alias)
    end
  end

  operation :update,
    summary: "Update pipeline alias",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Alias ID", type: :string, required: true]
    ],
    request_body: {"Alias", "application/json", BuildelWeb.Schemas.Aliases.UpdateRequest},
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Aliases.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _params) do
    %{alias: alias_config} = conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, alias} <- Pipelines.get_pipeline_alias(pipeline, id),
         {:ok, alias} <- Pipelines.update_alias(alias, alias_config) do
      conn
      |> put_status(:ok)
      |> render(:show, alias: alias)
    end
  end

  operation :delete,
    summary: "Delete pipeline alias",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Alias ID", type: :string, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Aliases.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, _params) do
    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, alias} <- Pipelines.get_pipeline_alias(pipeline, id),
         {:ok, _} <- Pipelines.delete_alias(alias) do
      conn |> put_status(:ok) |> render(:show, alias: alias)
    end
  end
end
