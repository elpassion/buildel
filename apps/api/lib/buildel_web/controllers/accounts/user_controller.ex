defmodule BuildelWeb.UserController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def me(conn, _params) do
    user = conn.assigns.current_user
    conn |> put_view(BuildelWeb.UserJSON) |> render(:show, user: user)
  end
end
