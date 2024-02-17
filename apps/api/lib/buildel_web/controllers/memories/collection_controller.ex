defmodule BuildelWeb.CollectionController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :index do
    optional(:collection_name, :string)
  end

  def index(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, validated_params} <-
           validate(:index, params),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         collections <-
           Buildel.Memories.list_organization_collections(organization, validated_params) do
      render(conn, :index, collections: collections)
    end
  end

  def show(conn, %{"organization_id" => organization_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, id) do
      render(conn, :show, collection: collection)
    end
  end

  defparams :create do
    required(:organization_id, :string)
    required(:collection_name, :string)

    required(:embeddings, :map) do
      required(:api_type, :string)
      required(:model, :string)
      required(:secret_name, :string)
    end
  end

  def create(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{collection_name: collection_name} = params} <- validate(:create, params),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <-
           Buildel.Organizations.get_organization_secret(
             organization,
             params.embeddings.secret_name
           ),
         {:ok, collection} <-
           Buildel.Memories.upsert_collection(%{
             organization_id: organization.id,
             collection_name: collection_name,
             embeddings: params.embeddings
           }) do
      conn
      |> put_status(:created)
      |> render(:show, collection: collection)
    end
  end

  def delete(conn, %{"organization_id" => organization_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         :ok <- Buildel.Memories.delete_organization_memory_collection(organization, id) do
      conn |> put_status(:ok) |> json(%{})
    end
  end
end
