defmodule BuildelWeb.UserPasswordController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Accounts
  alias Accounts.User

  action_fallback BuildelWeb.FallbackController

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :update do
    required(:current_password, :string, min: 12)
    required(:password, :string, min: 12)
    required(:password_confirmation, :string, min: 12)
  end

  def update(conn, params) do
    with {:ok, password_params} <- validate(:update, params),
         user <- conn.assigns.current_user,
         {:ok, %User{} = user} <-
           Accounts.update_user_password(user, password_params.current_password, %{
             password: password_params.password,
             password_confirmation: password_params.password_confirmation
           }) do
      conn
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:ok)
      |> render(:show, user: user)
    end
  end
end
