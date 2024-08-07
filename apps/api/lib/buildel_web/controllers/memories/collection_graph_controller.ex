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
             :ok <- Buildel.MemoriesGraph.generate_and_save_graph(organization, collection),
             graph <- Buildel.MemoriesGraph.get_graph(organization, collection) do
          render(conn, :show, graph: graph)
        end
    end
  end
end
