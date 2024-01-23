defmodule BuildelWeb.BlockTypesController do
  use Phoenix.Controller

  def index(conn, %{"block_name" => block_name}) do
    render(conn, :index, block: Buildel.Blocks.type(block_name).options)
  end

  def index(conn,  _params) do
    render(conn, :index, block_types: Buildel.Blocks.list_types())
  end

  def overviews(conn,  _params) do
    render(conn, :overviews, block_overviews: Buildel.Blocks.list_types_overviews())
  end
end
