# defmodule BuildelWeb.RawBodyReader do
#   import Plug.Conn

#   def init(opts), do: opts

#   def call(conn, _opts) do
#     {:ok, raw_body, conn} = read_body(conn, length: 8_000_000)

#     conn
#     |> assign(:raw_body, raw_body)
#     |> put_in([:adapter, :req_body], {:ok, raw_body})
#   end
# end

defmodule BuildelWeb.CustomBodyReader do
  def read_body(conn, opts) do
    {:ok, body, conn} = Plug.Conn.read_body(conn, opts)
    conn = Plug.Conn.assign(conn, :raw_body, body)
    {:ok, body, conn}
  end
end
