defmodule BuildelWeb.BasicAuth do
  alias Plug.BasicAuth

  def basic_auth(conn, _opts) do
    [username: username, password: password] = Application.fetch_env!(:buildel, :basic_auth)
    BasicAuth.basic_auth(conn, username: username, password: password)
  end
end
