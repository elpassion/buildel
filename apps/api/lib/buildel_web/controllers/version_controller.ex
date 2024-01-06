defmodule BuildelWeb.VersionController do
  use Phoenix.Controller

  def index(conn, _params) do
    conn
    |> put_status(200)
    |> json(%{ok: true})
  end
end
