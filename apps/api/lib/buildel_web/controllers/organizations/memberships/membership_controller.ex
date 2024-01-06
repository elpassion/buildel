defmodule BuildelWeb.OrganizationMembershipController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, %{"organization_id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         memberships <- Organizations.list_organization_memberships(organization) do
      render(conn, :index, memberships: memberships)
    end
  end
end
