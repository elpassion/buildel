defmodule BuildelWeb.MemoryChunkController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["memory chunk"]

  operation :index,
    summary: "List memory chunks",
    parameters:
      [
        organization_id: [in: :path, description: "Organization ID", type: :integer],
        memory_collection_id: [in: :path, description: "Memory collection ID", type: :integer],
        memory_id: [in: :path, description: "Memory ID", type: :integer]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.MemoryChunks.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  @default_params %{
    "page" => 0,
    "per_page" => 10
  }

  def index(
        conn,
        _params
      ) do
    %{
      organization_id: organization_id,
      memory_collection_id: _memory_collection_id,
      memory_id: memory_id
    } =
      conn.params

    params = Map.merge(@default_params, conn.params)

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         memory <-
           Buildel.Memories.get_organization_memory!(organization, memory_id),
         chunks <-
           Buildel.Memories.list_organization_memory_chunks(organization, memory, %{}) do
      render(conn, :index, chunks: chunks, pagination_params: params)
    end
  end
end
