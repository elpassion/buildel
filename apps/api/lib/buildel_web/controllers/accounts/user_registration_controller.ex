defmodule BuildelWeb.UserRegistrationController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Buildel.Accounts
  alias Buildel.Accounts.User

  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :create,
    summary: "Create user forgot password request",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.CreateRegistrationRequest},
    responses: [
      created: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ]

  def create(conn, _params) do
    %{user: user_params} = conn.body_params

    with {:ok, %User{} = user} <- Accounts.register_user(user_params),
         {:ok, _} =
           Accounts.deliver_user_confirmation_instructions(
             user,
             # TODO: Fix confirmation url :D
             fn _token ->
               "#{Application.fetch_env!(:buildel, :page_url)}"
             end
           ) do
      conn
      |> UserAuth.log_in_user(user, %{"remember_me" => "true"})
      |> put_view(BuildelWeb.UserJSON)
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/users/me")
      |> render(:show, user: user)
    else
      {:error, %Ecto.Changeset{action: :insert}} ->
        {:error,
         %Ecto.Changeset{
           action: :validate,
           errors:
             %{global: "email has already been taken"}
             |> Enum.map(fn {key, value} -> {key, {value, []}} end)
             |> Enum.into(%{}),
           changes: %{},
           types: %{}
         }}

      e ->
        e
    end
  end
end
