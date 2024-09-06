defmodule BuildelWeb.MemoryChunkPublicController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["memory chunk"]

  operation :index,
    summary: "List memory chunks",
    parameters:
      [
        memory_temporary_uuid: [in: :path, description: "Memory temporary ID", type: :string]
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
      memory_temporary_uuid: memory_temporary_uuid
    } =
      conn.params

    params = Map.merge(@default_params, conn.params)

    with {:ok, chunk} <-
           Buildel.MemoriesAccess.get_state(memory_temporary_uuid),
         memory <- Buildel.Memories.get_memory!(chunk.memory_id),
         organization <- Buildel.Organizations.get_organization!(memory.organization_id),
         chunks <-
           Buildel.Memories.list_organization_memory_chunks(organization, memory, %{}) do
      render(conn, :index, chunks: chunks, pagination_params: params)
    end
  end

  operation :show,
    summary: "Show memory chunk",
    parameters: [
      chunk_temporary_uuid: [in: :path, description: "Memory chunk temporary ID", type: :string]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.MemoryChunks.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(
        conn,
        _params
      ) do
    %{
      chunk_temporary_uuid: chunk_temporary_uuid
    } =
      conn.params

    with {:ok, chunk} <-
           Buildel.MemoriesAccess.get_state(chunk_temporary_uuid),
         memory <- Buildel.Memories.get_memory!(chunk.memory_id),
         chunk <-
           Buildel.Memories.get_organization_memory_chunk(
             memory.organization_id,
             memory.memory_collection_id,
             chunk.chunk_id
           ) do
      render(conn, :show, chunk: chunk)
    end
  end
end
