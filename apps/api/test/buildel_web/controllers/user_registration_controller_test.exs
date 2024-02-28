defmodule BuildelWeb.UserRegistrationControllerTest do
  use BuildelWeb.ConnCase, async: true

  import Buildel.AccountsFixtures

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  describe "POST /api/users/register" do
    @tag :capture_log
    test "creates account and logs the user in", %{conn: conn, api_spec: api_spec} do
      email = unique_user_email()

      conn =
        post(conn, ~p"/api/users/register", %{
          "user" => valid_user_attributes(email: email)
        })

      response = json_response(conn, 201)
      assert_schema(response, "UserShowResponse", api_spec)

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
                   "email" => ["Invalid format. Expected ~r/^[^\\s]+@[^\\s]+$/"],
                   "password" => ["String length is smaller than minLength: 12"]
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
        post(
          build_conn() |> put_req_header("content-type", "application/json"),
          ~p"/api/users/register",
          %{
            "user" => valid_user_attributes(email: email)
          }
        )

      assert json_response(conn, 422) == %{
               "errors" => %{
                 "global" => ["email has already been taken"]
               }
             }
    end
  end
end
