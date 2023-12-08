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

  defparams :update do
    required(:organization, :map) do
      required(:name, :string)
    end
  end


  def update(conn, %{"id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{organization: organization_params}} <- validate(:update, params),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.update_organization(organization, organization_params) do

      conn
        |> put_status(:ok)
        |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
        |> render(:show, organization: organization)
    end
  end

  def get_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end

  def reset_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id),
         {:ok, organization} <- Organizations.reset_organization_api_key(organization) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end
end
