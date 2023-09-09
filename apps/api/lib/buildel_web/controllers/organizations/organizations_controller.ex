defmodule BuildelWeb.OrganizationController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, _) do
    organizations = conn.assigns.current_user |> Organizations.list_user_organizations()
    render(conn, :index, organizations: organizations)
  end
end
