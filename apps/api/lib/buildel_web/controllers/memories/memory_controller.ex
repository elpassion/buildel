defmodule BuildelWeb.MemoryController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(
        conn,
        %{"organization_id" => organization_id, "memory_collection_id" => memory_collection_id}
      ) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         memories <-
           Buildel.Memories.list_organization_collection_memories(organization, collection) do
      render(conn, :index, memories: memories)
    end
  end

  defparams :create do
    required(:file_id, :string)
  end

  def create(
        conn,
        %{"organization_id" => organization_id, "memory_collection_id" => memory_collection_id} =
          params
      ) do
    user = conn.assigns.current_user

    with {:ok, %{file_id: file_id}} <- validate(:create, params),
         {:ok, organization} <-
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

  def delete(conn, %{"organization_id" => organization_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <- Buildel.Memories.delete_organization_memory(organization, id) do
      conn |> put_status(:ok) |> json(%{})
    end
  end
end
