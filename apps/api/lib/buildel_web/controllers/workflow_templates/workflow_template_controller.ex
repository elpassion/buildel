defmodule BuildelWeb.WorkflowTemplateController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["workflow template"]

  operation :index,
    summary: "List available templates",
    parameters: [],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.WorkflowTemplates.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    with workflow_templates <-
           Buildel.WorkflowTemplates.get_workflow_template_names() do
      render(conn, :index, workflow_templates: workflow_templates)
    end
  end
end
