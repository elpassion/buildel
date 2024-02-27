defmodule BuildelWeb.UserControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user]

  describe "GET /users/me" do

    test_requires_authentication %{conn: conn} do
      get(conn, ~p"/api/users/me")
    end

    test "returns the user", %{conn: conn, user: user, api_spec: api_spec} do
      conn = get(conn, ~p"/api/users/me")

      response = json_response(conn, 200)

      assert response["data"] == %{
               "id" => user.id,
             }

      assert_schema(response, "UserShowResponse", api_spec)
    end

  end

end
