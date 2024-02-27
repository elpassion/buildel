defmodule BuildelWeb.UserPasswordController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Accounts
  alias Accounts.User

  action_fallback BuildelWeb.FallbackController

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :update,
    summary: "Update user password",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.UpdatePasswordRequest},
    responses: [
      ok: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def update(conn, _params) do
    password_params = conn.body_params
    with user <- conn.assigns.current_user,
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
