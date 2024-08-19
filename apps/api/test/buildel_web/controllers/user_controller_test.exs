defmodule BuildelWeb.UserControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
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
               "marketing_agreement" => user.marketing_agreement
             }

      assert_schema(response, "UserShowResponse", api_spec)
    end
  end

  describe "PUT /users" do
    test_requires_authentication %{conn: conn} do
      put(conn, ~p"/api/users", %{})
    end

    test "validates body", %{conn: conn} do
      conn = put(conn, ~p"/api/users", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "updates the user", %{conn: conn, user: user, api_spec: api_spec} do
      conn =
        put(conn, ~p"/api/users", %{
          "marketing_agreement" => true
        })

      response = json_response(conn, 200)

      assert response["data"] == %{
               "id" => user.id,
               "marketing_agreement" => true
             }

      assert_schema(response, "UserShowResponse", api_spec)
    end
  end
end
