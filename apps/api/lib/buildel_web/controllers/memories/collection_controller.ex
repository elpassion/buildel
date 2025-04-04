defmodule BuildelWeb.CollectionController do
  alias Buildel.Memories.MemoryCollectionSearch
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

  operation :search,
    summary: "Search in collection documents",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Collection ID", type: :integer],
      query: [in: :query, description: "Search query", type: :string],
      limit: [in: :query, description: "Results limit", type: :integer],
      token_limit: [in: :query, description: "Token limit", type: :integer],
      extend_neighbors: [in: :query, description: "Extend neighbor chunks", type: :boolean],
      extend_parents: [in: :query, description: "Extend parent context", type: :boolean],
      memory_id: [in: :query, description: "Memory ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.SearchResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def search(conn, _params) do
    %{
      organization_id: organization_id,
      id: id,
      query: search_query
    } =
      conn.params

    params =
      MemoryCollectionSearch.Params.from_map(
        conn.params
        |> Map.put(:search_query, search_query)
        |> Map.put(:where, %{
          "memory_id" => Map.get(conn.params, :memory_id)
        })
      )

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, id),
         {memory_chunks, result_tokens, embeddings_tokens} <-
           MemoryCollectionSearch.new(organization, collection)
           |> MemoryCollectionSearch.search(params),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: embeddings_tokens,
               model: collection.embeddings_model,
               endpoint: collection.embeddings_endpoint
             }
           ),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(
             organization,
             %{
               amount: cost_amount,
               input_tokens: embeddings_tokens,
               output_tokens: 0
             }
           ),
         {:ok, _} <-
           Buildel.Memories.create_memory_collection_cost(collection, cost, %{
             cost_type: :query,
             description: "collection_search"
           }) do
      render(conn, :search, memory_chunks: memory_chunks, total_tokens: result_tokens)
    end
  end

  operation :index,
    summary: "List collections",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      collection_name: [in: :query, description: "Collection name", type: :string],
      search: [
        in: :query,
        description: "Search query",
        schema: %Schema{type: :string},
        required: false
      ]
    ] ++ BuildelWeb.Schemas.Pagination.default_params(%{
           page: nil,
           per_page: nil
    }),
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    queryParams =
      Buildel.Memories.ListParams.from_map(conn.query_params)


    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collections, count} <-
           Buildel.Memories.list_organization_collections(organization, conn.params, queryParams) do

      render(conn, :index, collections: collections, params: queryParams, total: count)
    end
  end

  operation :show,
    summary: "Show collection",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, id: id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, id) do
      render(conn, :show, collection: collection)
    end
  end

  operation :create,
    summary: "Create collection",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body:
      {"collection", "application/json", BuildelWeb.Schemas.Collections.CreateRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Collections.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params

    %{
      collection_name: collection_name,
      embeddings: embeddings,
      chunk_size: chunk_size,
      chunk_overlap: chunk_overlap
    } =
      conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <-
           Buildel.Organizations.get_organization_secret(
             organization,
             embeddings.secret_name
           ),
         {:ok, collection} <-
           Buildel.Memories.upsert_collection(%{
             organization_id: organization.id,
             collection_name: collection_name,
             embeddings: embeddings,
             chunk_size: chunk_size,
             chunk_overlap: chunk_overlap
           }) do
      conn
      |> put_status(:created)
      |> render(:show, collection: collection)
    end
  end

  operation :delete,
    summary: "Delete collection",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Collection ID", type: :integer]
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

  def delete(conn, _params) do
    %{organization_id: organization_id, id: id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         :ok <- Buildel.Memories.delete_organization_memory_collection(organization, id) do
      conn |> put_status(:ok) |> json(%{})
    end
  end

  operation :update,
    summary: "Update collection",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body:
      {"collection", "application/json", BuildelWeb.Schemas.Collections.UpdateRequest},
    responses: [
      created: {"ok", "application/json", BuildelWeb.Schemas.Collections.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _params) do
    %{organization_id: organization_id, id: id} = conn.params

    %{embeddings: embeddings} =
      conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <-
           Buildel.Organizations.get_organization_secret(
             organization,
             embeddings.secret_name
           ),
         {:ok, collection} <- Buildel.Memories.get_organization_collection(organization, id),
         {:ok, updated_collection} <-
           Buildel.Memories.upsert_collection(%{
             organization_id: organization.id,
             collection_name: collection.collection_name,
             embeddings: %{
               api_type: collection.embeddings_api_type,
               model: collection.embeddings_model,
               secret_name: embeddings.secret_name,
               endpoint: collection.embeddings_endpoint
             }
           }) do
      conn
      |> put_status(:ok)
      |> render(:show, collection: updated_collection)
    end
  end
end
