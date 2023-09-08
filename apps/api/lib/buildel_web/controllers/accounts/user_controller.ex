defmodule BuildelWeb.UserController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Accounts
  alias Buildel.Accounts.User

  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def me(conn, _params) do
    user = conn.assigns.current_user
    render(conn, :show, user: user)
  end
end
