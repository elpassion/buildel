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

  operation :state,
    summary: "Show collection graph processing state",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.Graphs.StateResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def state(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         {:ok, state} <- Buildel.MemoriesGraph.get_state(memory_collection_id) do
      render(conn, :state, state: state)
    end
  end

  operation :show,
    summary: "Show collection graph",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.Graphs.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         graph <- Buildel.MemoriesGraph.get_graph(organization, collection) do
      render(conn, :show, graph: graph)
    end
  end

  operation :related,
    summary: "Show related graph nodes",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer],
      chunk_id: [in: :query, description: "Chunk ID", type: :string],
      limit: [in: :query, description: "Limit related nodes", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.Graphs.RelatedResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def related(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id,
      chunk_id: chunk_id,
      limit: limit
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         chunks <-
           Buildel.MemoriesGraph.get_related_nodes(organization, collection, chunk_id, limit) do
      render(conn, :related, chunks: chunks)
    end
  end

  operation :details,
    summary: "Show graph node details",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer],
      chunk_id: [in: :query, description: "Chunk ID", type: :string]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.Graphs.DetailsResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def details(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id,
      chunk_id: chunk_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         {:ok, chunk} <-
           Buildel.MemoriesGraph.get_node_details(organization, collection, chunk_id) do
      render(conn, :details, chunk: chunk)
    end
  end

  operation :create,
    summary: "Generate collection graph",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      memory_collection_id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      created: {"created", "application/json", nil},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{
      organization_id: organization_id,
      memory_collection_id: memory_collection_id
    } = conn.params

    user = conn.assigns.current_user

    case Application.fetch_env!(:buildel, :skip_flame) do
      true ->
        conn
        |> put_status(:created)
        |> json(%{})

      _ ->
        with {:ok, organization} <-
               Buildel.Organizations.get_user_organization(user, organization_id),
             {:ok, collection} <-
               Buildel.Memories.get_organization_collection(organization, memory_collection_id),
             {:ok, state} <-
               Buildel.MemoriesGraph.get_state(memory_collection_id),
             graph <- Buildel.MemoriesGraph.get_graph(organization, collection) do
          if state == nil do
            :ok = Buildel.MemoriesGraph.generate_and_save_graph(organization, collection)
          end

          render(conn, :show, graph: graph)
        end
    end
  end
end
