defmodule BuildelWeb.DatasetRowsController do
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
      ok: {"ok", "application/json", BuildelWeb.Schemas.Datasets.ShowResponse},
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
end
