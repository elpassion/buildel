defmodule BuildelWeb.ExperimentController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["experiment"]

  operation :show,
    summary: "Get organization experiment",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Experiment ID", type: :string]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Experiments.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, id: experiment_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, experiment} <-
           Buildel.Experiments.get_organization_experiment(organization, experiment_id) do
      render(conn, :show, experiment: experiment)
    end
  end

  operation :index,
    summary: "List organization experiments",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Experiments.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         experiments <-
           Buildel.Experiments.list_organization_experiments(organization) do
      render(conn, :index, experiments: experiments)
    end
  end

  operation :create,
    summary: "Create a new experiment",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body:
      {"experiment", "application/json", BuildelWeb.Schemas.Experiments.CreateExperimentRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Experiments.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _) do
    %{organization_id: organization_id} = conn.params

    user = conn.assigns.current_user

    experiment_attrs =
      Map.merge(conn.body_params.experiment, %{organization_id: organization_id})

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _pipeline} <-
           Buildel.Pipelines.get_organization_pipeline(
             organization,
             conn.body_params.experiment.pipeline_id
           ),
         {:ok, _dataset} <-
           Buildel.Datasets.get_organization_dataset(
             organization,
             conn.body_params.experiment.dataset_id
           ),
         {:ok, experiment} <-
           Buildel.Experiments.create_experiment(experiment_attrs) do
      conn
      |> put_status(:created)
      |> render(:show, experiment: experiment)
    end
  end

  operation :delete,
    summary: "Delete an experiment",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Experiment ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"deleted", "application/json", nil},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, _) do
    %{organization_id: organization_id, id: experiment_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, experiment} <-
           Buildel.Experiments.get_organization_experiment(organization, experiment_id),
         {:ok, _} <- Buildel.Experiments.delete_experiment(experiment) do
      conn
      |> put_status(:ok)
      |> json(%{})
    end
  end
end
