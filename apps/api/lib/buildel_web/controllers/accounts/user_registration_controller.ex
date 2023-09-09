defmodule BuildelWeb.UserRegistrationController do
  use BuildelWeb, :controller
  use BuildelWeb.ControllerValidator

  alias Buildel.Accounts
  alias Buildel.Accounts.User

  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  defparams :create do
    required(:user, :map) do
      required(:email, :string, format: :email)
      required(:password, :string, min: 12)
    end
  end

  def create(conn, params) do
    with {:ok, %{user: user_params}} <- validate(:create, params),
         {:ok, %User{} = user} <- Accounts.register_user(user_params),
         {:ok, _} =
           Accounts.deliver_user_confirmation_instructions(
             user,
             &url(~p"/api/users/confirm/#{&1}")
           ) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    else
      {:error, %Ecto.Changeset{action: :insert}} ->
        {:error, changeset_error(global: "email has already been taken")}

      e ->
        e
    end
  end
end
