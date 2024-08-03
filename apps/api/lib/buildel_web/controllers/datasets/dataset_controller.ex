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

  operation :show,
    summary: "Get organization dataset",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Dataset ID", type: :string]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, id: dataset_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <-
           Buildel.Datasets.get_organization_dataset(organization, dataset_id) do
      render(conn, :show, dataset: dataset)
    end
  end

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

  operation :delete,
    summary: "Create a new dataset",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Dataset ID", type: :integer]
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
    %{organization_id: organization_id, id: dataset_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         {:ok, _} <- Buildel.Datasets.delete_dataset(dataset) do
      conn
      |> put_status(:ok)
      |> json(%{})
    end
  end

  operation :update,
    summary: "Update a dataset",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Dataset ID", type: :integer]
    ],
    request_body:
      {"dataset", "application/json", BuildelWeb.Schemas.Datasets.UpdateDatasetRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.CreateDatasetResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _) do
    %{organization_id: organization_id, id: dataset_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         {:ok, dataset} <-
           Buildel.Datasets.update_dataset(
             dataset,
             conn.body_params.dataset
           ) do
      conn
      |> put_status(:ok)
      |> render(:show, dataset: dataset)
    end
  end

  operation :create_file,
    summary: "Add a file to dataset",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Dataset ID", type: :integer]
    ],
    request_body:
      {"dataset", "application/json", BuildelWeb.Schemas.Datasets.Files.CreateFileRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.CreateDatasetResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create_file(conn, _) do
    %{organization_id: organization_id, id: dataset_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         {:ok, dataset} <- Buildel.Datasets.add_file_to_dataset(dataset, conn.body_params.file) do
      conn
      |> put_status(:ok)
      |> render(:show, dataset: dataset)
    end
  end
end
