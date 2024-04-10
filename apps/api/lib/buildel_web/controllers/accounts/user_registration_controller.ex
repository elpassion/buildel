defmodule BuildelWeb.UserRegistrationController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  alias Buildel.Accounts
  alias Buildel.Accounts.User
  alias Buildel.Invitations
  alias Buildel.Organizations

  alias BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["user"]

  operation :check,
    summary: "Check if registration is possible",
    parameters: [],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Registrations.ShowResponse}
    ]

  def check(conn, _params) do
    case Accounts.check_if_any_account_exist() do
      :not_found ->
        conn
        |> put_status(:ok)
        |> json(%{
          data: %{
            registration_disabled: false
          }
        })

      :ok ->
        conn
        |> put_status(:ok)
        |> json(%{
          data: %{
            registration_disabled: true
          }
        })
    end
  end

  operation :create,
    summary: "Create user registration request",
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

    with {:ok, _} <- registration_mode(),
         {:ok, %User{} = user} <- Accounts.register_user(user_params),
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
      {:error, :registration_disabled} ->
        {:error, :forbidden}

      {:error, %Ecto.Changeset{action: :insert}} ->
        {:error,
         changeset_for_errors(%{
           global: "Email has already been taken."
         })}

      e ->
        e
    end
  end

  operation :invitation_create,
    summary: "Create user registration request from invite",
    parameters: [],
    request_body:
      {"user", "application/json", BuildelWeb.Schemas.Users.CreateInvitationRegistrationRequest},
    responses: [
      created: {"user", "application/json", BuildelWeb.Schemas.Users.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ]

  def invitation_create(conn, _params) do
    %{user: user_params} = conn.body_params

    with {:ok, hashed_token} <- Invitations.verify_token(user_params.token),
         {:ok, invitation} <- Invitations.get_invitation_by_token(hashed_token),
         {:ok, invitation} <- Invitations.verify_invitation(invitation),
         {:ok, %User{} = user} <-
           Accounts.register_user(%{
             email: invitation.email,
             password: user_params.password
           }),
         {:ok, _membership} <-
           Organizations.create_membership(%{
             organization_id: invitation.organization_id,
             user_id: user.id
           }),
         {:ok, _} <- Invitations.resolve_invitation(invitation),
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
      {:error, :invitation_expired} ->
        {:error,
         changeset_for_errors(%{
           "invitation.email": "Invitation expired."
         })}

      {:error, :invalid_token} ->
        {:error,
         changeset_for_errors(%{
           "invitation.token": "Invalid invitation token."
         })}

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

  defp registration_mode() do
    with true <- Application.fetch_env!(:buildel, :registration_disabled) do
      case Accounts.check_if_any_account_exist() do
        :not_found -> {:ok, :registration_enabled}
        :ok -> {:error, :registration_disabled}
      end
    else
      false -> {:ok, :registration_enabled}
    end
  end

  defp changeset_for_errors(errors) do
    %Ecto.Changeset{
      action: :validate,
      errors:
        errors
        |> Enum.map(fn {key, value} -> {key, {value, []}} end)
        |> Enum.into(%{}),
      changes: %{},
      types: %{}
    }
  end
end
