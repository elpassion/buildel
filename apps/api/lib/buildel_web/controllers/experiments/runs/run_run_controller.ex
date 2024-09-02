defmodule BuildelWeb.ExperimentRunRunController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Experiments.Runs.Run
  alias Buildel.Experiments
  alias Buildel.Experiments.Experiment
  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)
  plug BuildelWeb.FormDataArrayParserPlug

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["experiment"]

  operation :export,
    summary: "Export experiment run runs",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      experiment_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      run_id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def export(conn, _params) do
    %{organization_id: organization_id, experiment_id: experiment_id, run_id: run_id} =
      conn.params

    user = conn.assigns.current_user

    conn =
      conn
      |> put_resp_content_type("text/csv")
      |> put_resp_header(
        "content-disposition",
        "attachment; filename=\"run_#{run_id}.csv\""
      )
      |> send_chunked(200)

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, %Experiment{} = experiment} <-
           Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, %Run{} = run} <- Experiments.Runs.get_experiment_run(experiment, run_id),
         {:ok, conn} <- Experiments.Runs.stream_csv(conn, run) do
      conn
    end
  end

  operation :index,
    summary: "List experiment run runs",
    parameters:
      [
        organization_id: [
          in: :path,
          description: "Organization ID",
          type: :integer,
          required: true
        ],
        experiment_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
        run_id: [in: :path, description: "Run ID", type: :integer, required: true]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Experiments.Runs.Runs.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, experiment_id: experiment_id, run_id: run_id} =
      conn.params

    pagination_params = conn.params |> Map.take([:page, :per_page])

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Experiment{} = experiment} <-
           Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, %Run{} = run} <- Experiments.Runs.get_experiment_run(experiment, run_id),
         {:ok, runs, total} <-
           Experiments.Runs.list_experiment_run_runs(
             run,
             pagination_params
           ) do
      render(conn, :index, runs: runs, pagination_params: pagination_params, total: total)
    end
  end
end
