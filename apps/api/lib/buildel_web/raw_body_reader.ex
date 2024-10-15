defmodule BuildelWeb.RawBodyReader do
  import Plug.Conn

  def init(opts), do: opts

  def call(conn, _opts) do
    {:ok, raw_body, conn} = read_body(conn, length: 8_000_000)

    conn
    |> assign(:raw_body, raw_body)
  end
end
