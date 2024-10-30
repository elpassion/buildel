defmodule BuildelWeb.WorkflowTemplateController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["workflow template"]

  operation :index,
    summary: "List available templates",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.WorkflowTemplates.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, templates} <-
           Buildel.WorkflowTemplates.get_workflow_template_names(organization.id) do

        render(conn, :index, workflow_templates: templates)
    end
  end

  operation :create,
    summary: "Create pipeline from template",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body:
      {"template", "application/json", BuildelWeb.Schemas.WorkflowTemplates.CreateRequest},
    responses: [
      created:
        {"created", "application/json", BuildelWeb.Schemas.WorkflowTemplates.CreateResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{template_name: template_name} = conn.body_params
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, config} <-
           Buildel.WorkflowTemplates.create_pipeline_config_from_template(
             organization.id,
             template_name
           ),
         {:ok, pipeline} <- Pipelines.create_pipeline(config) do
      render(conn, :create, pipeline: pipeline)
    else
      e -> e
    end
  end
end
