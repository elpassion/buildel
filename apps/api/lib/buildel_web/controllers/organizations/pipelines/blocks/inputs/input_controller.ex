defmodule BuildelWeb.OrganizationPipelineBlockInputController do
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

  operation :index,
    summary: "Get block inputs",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      block_name: [in: :path, description: "Block Name", type: :string, required: true]
    ],
    responses: [
      created: {"ok", "application/json", nil},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      block_name: block_name
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         block when is_map(block) <-
           pipeline.config["blocks"] |> Enum.find(&(&1["name"] == block_name)),
         block_module <- Buildel.Blocks.type(block["type"]) do
      response =
        block_module.handle_dynamic_inputs(%{
          organization: organization,
          pipeline: pipeline,
          block: block
        })

      conn
      |> put_status(:ok)
      |> json(response)
    end
  end
end
