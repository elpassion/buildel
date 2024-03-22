defmodule BuildelWeb.OrganizationPipelinePublicController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["pipeline"]

  operation :show,
    summary: "Show public pipeline",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok:
        {"success", "application/json", BuildelWeb.Schemas.Pipelines.PipelinePublicShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id} = conn.params

    with organization <- Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id) do
      case pipeline.interface_config do
        %{"public" => true} -> render(conn, :show, pipeline: pipeline)
        _ -> {:error, :unauthorized}
      end
    end
  end
end
