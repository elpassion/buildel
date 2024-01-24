defmodule BuildelWeb.BlockTypesController do
  use Phoenix.Controller

  def index(conn, %{"type" => type}) do
    render(conn, :index, block_types: Buildel.Blocks.list_types() |> Enum.filter(fn block -> block.type == type end))
  end

  def index(conn,  _params) do
    render(conn, :index, block_types: Buildel.Blocks.list_types())
  end

  def overviews(conn,  _params) do
    render(conn, :overviews, block_overviews: Buildel.Blocks.list_types_overviews())
  end
end
