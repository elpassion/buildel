defmodule BuildelWeb.OrganizationController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, _) do
    organizations = conn.assigns.current_user |> Organizations.list_user_organizations()
    render(conn, :index, organizations: organizations)
  end

  def show(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id) do
      render(conn, :show, organization: organization)
    end
  end

  defparams :create do
    required(:organization, :map) do
      required(:name, :string)
    end
  end

  def create(conn, params) do
    with {:ok, %{organization: organization_params}} <- validate(:create, params),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.create_organization(
             organization_params
             |> Map.put(:user_id, conn.assigns.current_user.id)
           ) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
      |> render(:show, organization: organization)
    end
  end

  def get_api_keys(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         keys <- Organizations.list_organization_api_keys(organization) do
      render(conn, :keys, keys: keys)
    end
  end

  def create_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user
    with {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, key} <- Organizations.create_api_key(organization) do
      render(conn, :key, key: key, hidden: false)
    end
  end

  def delete_api_key(conn, %{"id" => organization_id, "key_id" => key_id}) do
    user = conn.assigns.current_user
    with {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, key} <- Organizations.delete_api_key(organization, key_id) do
      conn |> put_status(:ok) |> json(%{})
    end
  end
end
