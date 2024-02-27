defmodule BuildelWeb.UserPasswordResetControllerTest do
  use BuildelWeb.ConnCase, async: true

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json") |> put_req_header("content-type", "application/json")}
  end

  describe "POST /users/password/reset" do
    test "validates email format", %{conn: conn} do
      conn = post(conn, ~p"/api/users/password/reset", %{
        email: "wrongformat"
      })

      assert json_response(conn, 422)
    end

    test "returns 200 if ok", %{conn: conn} do
      conn = post(conn, ~p"/api/users/password/reset", %{
        email: "fine@email.com"
      })

      assert json_response(conn, 200)
    end

  end

  describe "PUT /users/password/reset" do
    setup [:register_and_log_in_user]
    setup %{ user: user } do
      token =
        Buildel.AccountsFixtures.extract_user_token(fn url ->
          Buildel.Accounts.deliver_user_reset_password_instructions(user, url)
        end)

      %{user: user, token: token}
    end

    test "validates password length", %{conn: conn, token: token} do
      conn = put(conn, ~p"/api/users/password/reset", %{
        token: token,
        password: "strings",
        password_confirmation: "strings"
      })

      assert json_response(conn, 422)
    end

    test "validates password match", %{conn: conn, token: token} do
      conn = put(conn, ~p"/api/users/password/reset", %{
        token: token,
        password: "stringstring",
        password_confirmation: "stringstring2"
      })

      assert json_response(conn, 422)
    end

    test "updates password", %{conn: conn, token: token} do
      conn = put(conn, ~p"/api/users/password/reset", %{
        token: token,
        password: "stringstring",
        password_confirmation: "stringstring"
      })

      assert json_response(conn, 200)
    end

  end

end
