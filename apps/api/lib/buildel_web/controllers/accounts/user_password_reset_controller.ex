defmodule BuildelWeb.UserPasswordResetController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Buildel.Accounts

  action_fallback BuildelWeb.FallbackController

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :create,
    summary: "Create user forgot password request",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.CreateForgotPasswordRequest},
    responses: [
      ok: {"success", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
    ]

  def create(conn, _params) do
    %{email: email} = conn.body_params
    with user <- Accounts.get_user_by_email(email),
         {:ok, _} <- deliver_user_reset_password_instructions(user) do
      conn
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:ok)
      |> json(%{})
    end
  end

  operation :update,
    summary: "Update forgotten password",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.UpdateForgotPasswordRequest},
    responses: [
      ok: {"success", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
    ]

  def update(conn, _params) do
    %{token: token, password: password, password_confirmation: password_confirmation} = conn.body_params
    with user <- Accounts.get_user_by_reset_password_token(token),
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
