defmodule BuildelWeb.BlockTypeControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "lists all block_types", %{conn: conn} do
      conn = get(conn, ~p"/api/block_types")
      assert json_response(conn, 200)["data"] |> Enum.count() == 38
    end

    test "lists all block_types filtered by type", %{conn: conn} do
      conn = get(conn, ~p"/api/block_types?type=text_input")
      assert json_response(conn, 200)["data"] |> Enum.count() == 1
    end
  end

  describe "overviews" do
    test "lists all block_types overviews", %{conn: conn} do
      conn = get(conn, ~p"/api/block_types/overviews")
      assert json_response(conn, 200)["data"] |> Enum.count() == 38
    end
  end
end
