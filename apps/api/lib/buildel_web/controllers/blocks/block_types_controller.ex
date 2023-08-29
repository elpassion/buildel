defmodule BuildelWeb.BlockTypesController do
  use Phoenix.Controller

  def index(conn, _params) do
    render(conn, :index, block_types: Buildel.Blocks.list_types())
  end
end
