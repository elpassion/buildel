defmodule BuildelWeb.UserPasswordControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.AccountsFixtures

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user]

  describe "update" do
    test_requires_authentication %{conn: conn} do
      put(conn, ~p"/api/users/password", %{})
    end

    test "requires a valid current password", %{conn: conn} do
      conn =
        put(conn, ~p"/api/users/password", %{
          current_password: "invalid_password",
          password: "new_password",
          password_confirmation: "new_password"
        })

      assert json_response(conn, 422)
    end

    test "validates password properties", %{conn: conn} do
      conn =
        put(conn, ~p"/api/users/password", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "validates password length", %{conn: conn} do
      conn =
        put(conn, ~p"/api/users/password", %{
          current_password: valid_user_password(),
          password: "too_short",
          password_confirmation: "too_short"
        })

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "updates the user password", %{conn: conn, api_spec: api_spec} do
      conn =
        put(conn, ~p"/api/users/password", %{
          current_password: valid_user_password(),
          password: "new_password",
          password_confirmation: "new_password"
        })

      response = json_response(conn, 200)

      assert_schema(response, "UserShowResponse", api_spec)
    end
  end
end
