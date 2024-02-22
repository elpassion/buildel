defmodule BuildelWeb.MemoryChunkController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :index do
    required(:page, :integer)
    required(:per_page, :integer)
  end

  @default_params %{
    "page" => 0,
    "per_page" => 10
  }

  def index(
        conn,
        %{
          "organization_id" => organization_id,
          "memory_collection_id" => _memory_collection_id,
          "id" => memory_id
        } = params
      ) do
    params = Map.merge(@default_params, params)

    user = conn.assigns.current_user

    with {:ok, params} <- validate(:index, params),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         memory <-
           Buildel.Memories.get_organization_memory!(organization, memory_id),
         chunks <-
           Buildel.Memories.list_organization_memory_chunks(organization, memory, %{}) do
      render(conn, :index, chunks: chunks, pagination_params: params)
    end
  end
end
