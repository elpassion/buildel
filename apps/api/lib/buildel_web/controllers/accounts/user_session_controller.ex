defmodule BuildelWeb.UserSessionController do
  use BuildelWeb, :controller

  alias Buildel.Accounts
  alias Buildel.Accounts.User
  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  def create(conn, %{"user" => user_params}) do
    %{"email" => email, "password" => password} = user_params

    with {:ok, %User{} = user} <- Accounts.get_user_by_email_and_password(email, password) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    end
  end

  def delete(conn, _params) do
    conn
    |> UserAuth.log_out_user()
    |> put_status(:no_content)
  end
end
