defmodule BuildelWeb.OrganizationPipelineBlockController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["block"]

  operation :create,
    summary: "Create block",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: {"block", "application/json", BuildelWeb.Schemas.Blocks.CreateRequest},
    responses: [
      created: {"created", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{block: block_config} = conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.create_block(pipeline, block_config) do
      conn
      |> put_status(:created)
      |> json(%{})
    end
  end
end
