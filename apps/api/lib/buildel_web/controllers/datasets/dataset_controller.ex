defmodule BuildelWeb.DatasetController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["dataset"]

  operation :index,
    summary: "List organization datasets",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.IndexResponse},
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
         datasets <-
           Buildel.Datasets.list_organization_datasets(organization) do
      render(conn, :index, datasets: datasets)
    end
  end

  operation :create,
    summary: "Create a new dataset",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body:
      {"dataset", "application/json", BuildelWeb.Schemas.Datasets.CreateDatasetRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.CreateDatasetResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _) do
    %{organization_id: organization_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <-
           Buildel.Datasets.create_organization_dataset(
             organization,
             conn.body_params.dataset
           ) do
      conn
      |> put_status(:created)
      |> render(:show, dataset: dataset)
    end
  end
end
