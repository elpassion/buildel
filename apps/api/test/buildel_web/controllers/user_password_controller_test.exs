defmodule BuildelWeb.UserPasswordControllerTest do
  use BuildelWeb.ConnCase

  import Buildel.AccountsFixtures

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user]

  describe "update" do
    test "requires authentication", %{conn: conn} do
      conn = log_out_user(conn)

      conn = put(conn, ~p"/api/users/password", %{})

      assert json_response(conn, 401)
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

    test "updates the user password", %{conn: conn} do
      conn =
        put(conn, ~p"/api/users/password", %{
          current_password: valid_user_password(),
          password: "new_password",
          password_confirmation: "new_password"
        })

      assert json_response(conn, 200)
    end
  end
end
