defmodule BuildelWeb.UserPasswordResetController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  alias Buildel.Accounts

  action_fallback BuildelWeb.FallbackController

  defparams :create do
    required(:email, :string, format?: ~r/@/)
  end

  def create(conn, params) do
    with {:ok, %{email: email}} <- validate(:create, params),
         user <- Accounts.get_user_by_email(email),
         {:ok, _} <- deliver_user_reset_password_instructions(user) do
      conn
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:ok)
      |> json(%{})
    end
  end

  defparams(:update) do
    required(:token, :string)
    required(:password, :string, min: 12)
    required(:password_confirmation, :string, min: 12)
  end

  def update(conn, params) do
    with {:ok, %{token: token, password: password, password_confirmation: password_confirmation}} <-
           validate(:update, params),
         user <- Accounts.get_user_by_reset_password_token(token),
         {:ok, _} <-
           Accounts.reset_user_password(user, %{
             password: password,
             password_confirmation: password_confirmation
           }) do
      conn
      |> put_status(:ok)
      |> json(%{})
    end
  end

  defp deliver_user_reset_password_instructions(nil), do: {:ok, nil}

  defp deliver_user_reset_password_instructions(user) do
    Accounts.deliver_user_reset_password_instructions(user, fn token ->
      "#{Application.fetch_env!(:buildel, :page_url)}/set-password?token=#{token}"
    end)
  end
end
