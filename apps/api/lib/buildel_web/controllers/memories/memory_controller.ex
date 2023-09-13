defmodule BuildelWeb.MemoryController do
  use BuildelWeb, :controller
  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def create(conn, _params) do
    conn
    |> put_status(:created)
    |> put_resp_header("location", ~p"/api/memories/123")
    |> render(:show, memory: %{})
  end
end
