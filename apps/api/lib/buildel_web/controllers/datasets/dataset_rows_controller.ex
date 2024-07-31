defmodule BuildelWeb.DatasetRowsController do
  alias Buildel.Datasets.DatasetRow
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
    summary: "List dataset rows",
    parameters:
      [
        organization_id: [in: :path, description: "Organization ID", type: :integer],
        dataset_id: [in: :path, description: "Dataset id", type: :integer]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.DatasetRows.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, dataset_id: dataset_id} = conn.params
    user = conn.assigns.current_user

    params = Buildel.Datasets.Rows.Params.from_map(conn.params)

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <-
           Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         {:ok, results, count} <-
           Buildel.Datasets.Rows.list_dataset_rows(dataset, params) do
      render(conn, :index, rows: results, params: params, total: count)
    end
  end

  operation :create,
    summary: "Create dataset row",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      dataset_id: [in: :path, description: "Dataset id", type: :integer]
    ],
    request_body:
      {"row", "application/json", BuildelWeb.Schemas.DatasetRows.CreateDatasetRowRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.DatasetRows.CreateDatasetRowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id, dataset_id: dataset_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <-
           Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         {:ok, row} <- Buildel.Datasets.Rows.create_row(dataset, %{data: conn.body_params.data}) do
      render(conn, :show, row: row)
    end
  end

  operation :show,
    summary: "Get dataset row",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      dataset_id: [in: :path, description: "Dataset id", type: :integer],
      id: [in: :path, description: "Row id", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.DatasetRows.CreateDatasetRowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, dataset_id: dataset_id, id: row_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <-
           Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         %DatasetRow{} = row <-
           Buildel.Datasets.Rows.get_dataset_row(dataset, row_id) do
      render(conn, :show, row: row)
    end
  end

  operation :delete,
    summary: "Delete dataset row",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      dataset_id: [in: :path, description: "Dataset id", type: :integer],
      id: [in: :path, description: "Row id", type: :integer]
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
    %{organization_id: organization_id, dataset_id: dataset_id, id: id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         %DatasetRow{} = row <- Buildel.Datasets.Rows.get_dataset_row(dataset, id),
         {:ok, _} <- Buildel.Datasets.Rows.update_row(row, %{data: conn.body_params.data}) do
      conn
      |> put_status(:ok)
      |> json(%{})
    end
  end

  operation :update,
    summary: "Update dataset row",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      dataset_id: [in: :path, description: "Dataset id", type: :integer],
      id: [in: :path, description: "Row id", type: :integer]
    ],
    request_body:
      {"row", "application/json", BuildelWeb.Schemas.DatasetRows.CreateDatasetRowRequest},
    responses: [
      ok:
        {"updated", "application/json", BuildelWeb.Schemas.DatasetRows.CreateDatasetRowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _) do
    %{organization_id: organization_id, dataset_id: dataset_id, id: id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, dataset} <- Buildel.Datasets.get_organization_dataset(organization, dataset_id),
         %DatasetRow{} = row <- Buildel.Datasets.Rows.get_dataset_row(dataset, id),
         {:ok, row} <- Buildel.Datasets.Rows.update_row(row, %{data: conn.body_params.data}) do
      render(conn, :show, row: row)
    end
  end
end
