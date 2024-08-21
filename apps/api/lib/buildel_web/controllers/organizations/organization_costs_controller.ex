defmodule BuildelWeb.OrganizationCostsController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Organizations
  alias Buildel.OrganizationCosts

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["organization costs"]

  operation :index,
    summary: "List organizations costs",
    parameters:
      [
        organization_id: [in: :path, description: "Organization ID", type: :integer]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok:
        {"organizations", "application/json", BuildelWeb.Schemas.OrganizationCosts.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _) do
    user = conn.assigns.current_user
    %{organization_id: organization_id} = conn.params

    params = OrganizationCosts.Params.from_map(conn.params)

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id),
         {:ok, costs, total} <- OrganizationCosts.list_organization_costs(organization, params) do
      render(conn, :index, costs: costs, params: params, total: total)
    end
  end
end
