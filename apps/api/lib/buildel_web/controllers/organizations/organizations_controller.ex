defmodule BuildelWeb.OrganizationController do
  use BuildelWeb, :controller
  use BuildelWeb.ControllerValidator

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, _) do
    organizations = conn.assigns.current_user |> Organizations.list_user_organizations()
    render(conn, :index, organizations: organizations)
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
end
