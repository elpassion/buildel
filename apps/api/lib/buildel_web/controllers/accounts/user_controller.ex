defmodule BuildelWeb.UserController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)

  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :me,
    summary: "Get me",
    parameters: [],
    request_body: nil,
    responses: [
      ok: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def me(conn, _params) do
    user = conn.assigns.current_user
    conn |> put_view(BuildelWeb.UserJSON) |> render(:show, user: user)
  end
end
