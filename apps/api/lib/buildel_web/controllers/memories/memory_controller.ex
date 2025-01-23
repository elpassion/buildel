defmodule BuildelWeb.MemoryController do
  import BuildelWeb.UserAuth

  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["memory"]

  operation :index,
    summary: "Retrieve all memories in a collection",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Memories.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(
        conn,
        %{organization_id: organization_id, memory_collection_id: memory_collection_id}
      ) do
    user = conn.assigns.current_user

    params =
      Buildel.Memories.ListParams.from_map(conn.query_params)

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         {:ok, memories, count} <-
           Buildel.Memories.list_organization_collection_memories(organization, collection, params) do

      render(conn, :index, memories: memories, params: params, total: count)
    end
  end

  operation :create,
    summary: "Create a memory",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: {"memory", "application/json", BuildelWeb.Schemas.Memories.CreateRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Memories.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(
        conn,
        %{organization_id: organization_id, memory_collection_id: memory_collection_id}
      ) do
    user = conn.assigns.current_user
    %{file_id: file_id} = conn.body_params

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         {:ok, memory} <-
           Buildel.Memories.create_organization_memory(
             organization,
             collection,
             file_id
           ) do
      conn
      |> put_status(:created)
      |> render(:show, memory: memory)
    else
      {:error, :invalid_api_key} ->
        {:error, %{errors: %{file: "Invalid API key"}}}

      {:error, :insufficient_quota} ->
        {:error, %{errors: %{file: "Insufficient quota for embeddings model"}}}

      err ->
        err
    end
  end

  operation :delete,
    summary: "Delete a memory",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer],
      id: [in: :path, description: "Memory ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", nil},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, %{
        organization_id: organization_id,
        memory_collection_id: memory_collection_id,
        id: id
      }) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <-
           Buildel.Memories.delete_organization_memory(organization, memory_collection_id, id) do
      conn |> put_status(:ok) |> json(%{})
    end
  end

  operation :bulk_delete,
    summary: "Bulk delete memories",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body:
      {"bulk_delete", "application/json", BuildelWeb.Schemas.Memories.BulkDeleteRequest},
    responses: [
      ok: {"ok", "application/json", nil},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def bulk_delete(conn, %{
        organization_id: organization_id,
        memory_collection_id: memory_collection_id
      }) do
    user = conn.assigns.current_user
    %{ids: ids} = conn.body_params

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <-
           Buildel.Memories.delete_organization_memory(organization, memory_collection_id, ids) do
      conn |> put_status(:ok) |> json(%{})
    end
  end
end
