defmodule BuildelWeb.CalculatorControllerTest do
  use BuildelWeb.ConnCase

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "add" do
    test "validates params", %{conn: conn} do
      conn = post(conn, ~p"/api/add", %{"left" => nil, "right" => nil})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "returns sum of left and right", %{conn: conn} do
      conn = post(conn, ~p"/api/add", %{"left" => 1, "right" => 2})

      assert json_response(conn, 200)["result"] == 3
    end
  end
end
