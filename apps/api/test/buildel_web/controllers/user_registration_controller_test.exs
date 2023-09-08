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
      response = json_response(conn, 200)
      assert response =~ email
    end

    test "render errors for invalid data", %{conn: conn} do
      conn =
        post(conn, ~p"/users/register", %{
          "user" => %{"email" => "with spaces", "password" => "too short"}
        })

      response = json_response(conn, 400)
      assert response =~ "Register"
      assert response =~ "must have the @ sign and no spaces"
      assert response =~ "should be at least 1 character"
    end
  end
end
