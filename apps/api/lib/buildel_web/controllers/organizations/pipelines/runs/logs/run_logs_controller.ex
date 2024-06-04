defmodule BuildelWeb.OrganizationPipelineRunLogsController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  alias Buildel.RunLogs
  alias Buildel.Organizations
  alias OpenApiSpex.Schema

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["run logs"]

  operation :index,
    summary: "List run logs",
    parameters:
      [
        organization_id: [
          in: :path,
          description: "Organization ID",
          type: :integer,
          required: true
        ],
        pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
        id: [in: :path, description: "Run ID", type: :integer, required: true],
        block_name: [
          in: :query,
          description: "Block name",
          type: :string,
          required: false
        ],
        start_date: [
          in: :query,
          description: "Start date",
          schema: %Schema{type: :string, format: :date_time},
          required: false
        ],
        end_date: [
          in: :query,
          description: "End date",
          schema: %Schema{type: :string, format: :date_time},
          required: false
        ]
      ] ++ BuildelWeb.Schemas.Pagination.cursor_params(),
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.RunLogs.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id, id: run_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, run_id),
         %Paginator.Page{metadata: metadata, entries: entries} <-
           RunLogs.list_run_logs(run, conn.params) do
      render(conn, :index, logs: entries, metadata: metadata)
    end
  end
end
