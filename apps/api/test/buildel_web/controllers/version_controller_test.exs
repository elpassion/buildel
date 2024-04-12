defmodule BuildelWeb.VersionControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  describe "index" do
    test "returns 200", %{conn: conn} do
      conn = get(conn, ~p"/")
      assert json_response(conn, 200)["ok"] == true
    end
  end
end
