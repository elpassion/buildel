defmodule BuildelWeb.UserSessionController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs
  use BuildelWeb.Validator

  alias Buildel.Accounts
  alias Buildel.Accounts.User
  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :create,
    summary: "Sign in user",
    parameters: [],
    request_body: {"user", "application/json", BuildelWeb.Schemas.Users.CreateLoginRequest},
    responses: [
      created: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ]

  defparams :create do
    required(:user, :map) do
      required(:email, :string, format: :email)
      required(:password, :string)
    end
  end

  def create(conn, _params) do
    %{user: %{email: email, password: password}} = conn.body_params

    with {:ok, %User{} = user} <-
           Accounts.get_user_by_email_and_password(email, password) do
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

  operation :create_google,
    summary: "Sign in with google",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.CreateLoginWithGoogleRequest},
    responses: [
      created: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ]

  def create_google(conn, _params) do
    %{token: token} = conn.body_params

    with {:ok, %{"email" => email}} <- BuildelWeb.GoogleToken.verify_and_validate(token),
         {:ok, %User{} = user} <- Accounts.get_or_create_user_by_email(email) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    else
      {:error, :registration_disabled} ->
        {:error, :forbidden}

      {:error, :not_found} ->
        {:error, changeset_error(global: "Invalid username or password")}

      err ->
        err
    end
  end

  operation :create_github,
    summary: "Sign in with github",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.CreateLoginWithGithubRequest},
    responses: [
      created: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ]

  def create_github(conn, _params) do
    %{token: token} = conn.body_params

    with {:ok, email} <-
           BuildelWeb.GithubToken.get_github_primary_email(token),
         {:ok, %User{} = user} <- Accounts.get_or_create_user_by_email(email) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    else
      {:error, :registration_disabled} ->
        {:error, :forbidden}

      {:error, :not_found} ->
        {:error, changeset_error(global: "Invalid username or password")}

      {:error, :failed_to_get_email} ->
        {:error, changeset_error(global: "Failed to get Github user")}

      err ->
        err
    end
  end

  operation :delete,
    summary: "Logout",
    parameters: [],
    request_body: nil,
    responses: [
      no_content: {"user", "application/json", nil}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, _params) do
    conn
    |> UserAuth.log_out_user()
    |> send_resp(:no_content, "")
  end
end
