defmodule BuildelWeb.BlockTypeControllerTest do
  use BuildelWeb.ConnCase

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all block_types", %{conn: conn} do
      conn = get(conn, ~p"/api/block_types")
      assert json_response(conn, 200)["data"] |> Enum.count() == 18
    end
  end
end
