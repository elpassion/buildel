defmodule BuildelWeb.UserSessionControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.AccountsFixtures

  setup %{conn: conn} do
    %{
      user: user_fixture(),
      conn:
        put_req_header(conn, "accept", "application/json")
        |> put_req_header("content-type", "application/json")
    }
  end

  describe "POST /users/log_in" do
    test "logs the user in", %{conn: conn, user: user, api_spec: api_spec} do
      conn =
        post(conn, ~p"/api/users/log_in", %{
          "user" => %{"email" => user.email, "password" => valid_user_password()}
        })

      assert get_session(conn, :user_token)
      conn = get(conn, ~p"/api/users/me")

      response = json_response(conn, 200)
      assert_schema(response, "UserShowResponse", api_spec)
    end

    test "logs the user in with remember me", %{conn: conn, user: user} do
      conn =
        post(conn, ~p"/api/users/log_in", %{
          "user" => %{
            "email" => user.email,
            "password" => valid_user_password(),
            "remember_me" => "true"
          }
        })

      assert conn.resp_cookies["_buildel_web_user_remember_me"]
      json_response(conn, 201)
      assert get_session(conn, :user_token)
    end

    test "returns error with invalid credentials", %{conn: conn} do
      conn =
        post(conn, ~p"/api/users/log_in", %{
          "user" => %{"email" => "invalid@email.com", "password" => "invalid_password"}
        })

      assert json_response(conn, 422) == %{
               "errors" => %{"global" => ["Invalid username or password"]}
             }
    end

    test "returns error with bad request", %{conn: conn} do
      conn =
        post(conn, ~p"/api/users/log_in", %{
          "user" => %{"email" => "invalid", "password" => "invalid_password"}
        })

      assert json_response(conn, 422) == %{
               "errors" => %{
                 "user" => %{"email" => ["Invalid format. Expected ~r/^[^\\s]+@[^\\s]+$/"]}
               }
             }
    end
  end

  describe "POST /users/google/log_in" do
    test "returns error with bad request", %{conn: conn} do
      conn =
        post(conn, ~p"/api/users/google/log_in", %{})

      assert json_response(conn, 422) == %{
               "errors" => %{
                 "token" => ["Missing field: token"]
               }
             }
    end
  end

  describe "DELETE /users/log_out" do
    test "logs the user out", %{conn: conn, user: user} do
      conn = conn |> log_in_user(user) |> delete(~p"/api/users/log_out")
      assert conn.status == 204
      refute get_session(conn, :user_token)
    end

    test "succeeds even if the user is not logged in", %{conn: conn} do
      conn = delete(conn, ~p"/api/users/log_out")
      assert conn.status == 204
      refute get_session(conn, :user_token)
    end
  end
end
