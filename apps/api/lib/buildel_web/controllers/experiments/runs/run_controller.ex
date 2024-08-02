defmodule BuildelWeb.ExperimentRunController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Experiments.Runs
  alias Buildel.Experiments
  alias Buildel.Experiments.Experiment
  alias OpenApiSpex.Schema
  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)
  plug BuildelWeb.FormDataArrayParserPlug

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["experiment"]

  operation :index,
    summary: "List experiment runs",
    parameters:
      [
        organization_id: [
          in: :path,
          description: "Organization ID",
          type: :integer,
          required: true
        ],
        experiment_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Experiments.Runs.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, experiment_id: experiment_id} = conn.params
    pagination_params = conn.params |> Map.take([:page, :per_page])

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Experiment{} = experiment} <-
           Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, runs, total} <-
           Experiments.Runs.list_experiment_runs(
             experiment,
             pagination_params
           ) do
      render(conn, :index, runs: runs, pagination_params: pagination_params, total: total)
    end
  end

  operation :create,
    summary: "Create experiment run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      experiment_id: [in: :path, description: "Experiment ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Experiments.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id, experiment_id: experiment_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Experiment{} = experiment} <-
           Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, run} <-
           Runs.create_experiment_run(experiment, %{}) do
      render(conn, :show, run: run)
    end
  end

  operation :show,
    summary: "Show experiment run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      experiment_id: [in: :path, description: "Experiment ID", type: :integer, required: true],
      id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Experiments.Runs.ShowResponse},
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
    %{organization_id: organization_id, experiment_id: experiment_id, id: id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Experiment{} = experiment} <-
           Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, run} <-
           Runs.get_experiment_run(experiment, id) do
      render(conn, :show, run: run)
    end
  end
end
