defmodule BuildelWeb.CollectionGraphController do
  import BuildelWeb.UserAuth

  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["collection graph"]

  operation :graph,
    summary: "Show collection graph",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer],
      top_percentage: [
        in: :query,
        description: "Top percentage of similarities to percive as edge",
        type: :number
      ]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.Graphs.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def graph(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id,
      top_percentage: top_percentage
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         matrix <-
           Buildel.MemoriesGraph.get_similarity_martix(organization, collection, top_percentage) do
      render(conn, :show, matrix: matrix)
    end
  end
end
