defmodule BuildelWeb.BlockTypesController do
  use Phoenix.Controller

  def index(conn, %{"block_name" => block_name}) do
    render(conn, :index, block: Buildel.Blocks.type(block_name).options)
  end

  def index(conn,  _params) do
    render(conn, :index, block_types: Buildel.Blocks.list_types())
  end
end
