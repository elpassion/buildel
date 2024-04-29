defmodule BuildelWeb.CollectionCostsController do
  alias OpenApiSpex.Schema

  import BuildelWeb.UserAuth

  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["collection"]

  operation :index,
    summary: "List collection costs. Returns costs for the current month by default.",
    parameters:
      [
        organization_id: [in: :path, description: "Organization ID", type: :integer],
        memory_collection_id: [in: :path, description: "Memory collection ID", type: :integer],
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
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.CollectionCosts.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, memory_collection_id: collection_id} = conn.params
    user = conn.assigns.current_user

    params = Buildel.Memories.MemoryCollectionCosts.Params.from_map(conn.params)

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, collection_id),
         {:ok, results, count} <-
           Buildel.Memories.MemoryCollectionCosts.list_collection_costs(collection, params) do
      render(conn, :index, collection_costs: results, params: params, total: count)
    end
  end
end
