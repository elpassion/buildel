defmodule BuildelWeb.MemoryController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :index do
    required(:collection_name, :string)
  end

  def index(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{collection_name: collection_name}} <- validate(:index, params),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         memories <-
           Buildel.Memories.list_organization_collection_memories(organization, collection_name) do
      render(conn, :index, memories: memories)
    end
  end

  defparams :create do
    required(:file, :map)
    required(:collection_name, :string)
  end

  def create(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{file: file, collection_name: collection_name}} <- validate(:create, params),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, memory} <-
           Buildel.Memories.create_organization_memory(organization, collection_name, file.path) do
      conn
      |> put_status(:created)
      |> render(:show, memory: memory)
    end
  end
end
