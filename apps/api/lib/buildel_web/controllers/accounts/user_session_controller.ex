defmodule BuildelWeb.UserSessionController do
  use BuildelWeb, :controller
  use BuildelWeb.ControllerValidator

  alias Buildel.Accounts
  alias Buildel.Accounts.User
  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  defparams :create do
    required(:user, :map) do
      required(:email, :string)
      required(:password, :string, min: 20)
    end
  end

  def create(conn, params) do
    with {:ok, %{user: %{email: email, password: password}}} <- validate(:create, params),
         {:ok, %User{} = user} <- Accounts.get_user_by_email_and_password(email, password) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    else
      {:error, :not_found} ->
        {:error, changeset_error(global: "Invalid username or password")}

      err ->
        err
    end
  end

  def delete(conn, _params) do
    conn
    |> UserAuth.log_out_user()
    |> put_status(:no_content)
  end
end
