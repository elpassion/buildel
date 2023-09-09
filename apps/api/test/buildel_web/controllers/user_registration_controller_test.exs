defmodule BuildelWeb.UserRegistrationControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.AccountsFixtures

  describe "POST /api/users/register" do
    @tag :capture_log
    test "creates account and logs the user in", %{conn: conn} do
      email = unique_user_email()

      conn =
        post(conn, ~p"/api/users/register", %{
          "user" => valid_user_attributes(email: email)
        })

      assert get_session(conn, :user_token)
      conn = get(conn, ~p"/api/users/me")
      json_response(conn, 200)
    end

    test "render errors for invalid data", %{conn: conn} do
      conn =
        post(conn, ~p"/api/users/register", %{
          "user" => %{"email" => "with spaces", "password" => "too short"}
        })

      assert json_response(conn, 422) == %{
               "errors" => %{
                 "user" => %{
                   "email" => ["has invalid format"],
                   "password" => ["should be at least 12 character(s)"]
                 }
               }
             }
    end

    test "fails to create already created account", %{conn: conn} do
      email = unique_user_email()

      conn =
        post(conn, ~p"/api/users/register", %{
          "user" => valid_user_attributes(email: email)
        })

      assert get_session(conn, :user_token)
      conn = get(conn, ~p"/api/users/me")
      json_response(conn, 200)

      conn =
        post(conn, ~p"/api/users/register", %{
          "user" => valid_user_attributes(email: email)
        })

      assert json_response(conn, 422) == %{
               "errors" => %{
                 "global" => ["email has already been taken"]
               }
             }
    end
  end
end
