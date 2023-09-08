defmodule BuildelWeb.UserRegistrationController do
  use BuildelWeb, :controller

  alias Buildel.Accounts
  alias Buildel.Accounts.User

  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  def create(conn, %{"user" => user_params}) do
    with {:ok, %User{} = user} <- Accounts.register_user(user_params),
         {:ok, _} =
           Accounts.deliver_user_confirmation_instructions(
             user,
             &url(~p"/api/users/confirm/#{&1}")
           ) do
      conn
      |> UserAuth.log_in_user(user)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    end
  end
end
