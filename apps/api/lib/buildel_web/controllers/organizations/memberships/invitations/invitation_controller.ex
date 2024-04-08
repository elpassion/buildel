defmodule BuildelWeb.OrganizationMembershipInvitationController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Organizations
  alias Buildel.Invitations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["invitation"]

  operation :index,
    summary: "List invitations",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Invitations.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         invitations <- Buildel.Invitations.list_organization_invitations(organization.id) do
      render(conn, :index, invitations: invitations)
    end
  end

  operation :create,
    summary: "Create invitation",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body:
      {"invitation", "application/json", BuildelWeb.Schemas.Invitations.CreateRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Invitations.ShowResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params
    %{email: user_email} = conn.body_params
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, user} <- fetch_user_by_email(user_email),
         {:ok, user_id} <- verify_existing_membership(user, organization_id),
         {:ok, invitation} <-
           Invitations.deliver_user_invitation_instructions(
             user_email,
             fn token ->
               "#{Application.fetch_env!(:buildel, :page_url)}?token=#{token}"
             end,
             organization.id,
             user_id
           ) do
      conn
      |> put_status(:created)
      |> render(:show, invitation: invitation)
    else
      {:error, %Ecto.Changeset{errors: [organization_id: {"has already been taken", _}]}} ->
        {:error,
         changeset_for_errors(%{
           "invitation.email": "User has already been invited to the organization."
         })}

      {:error, :user_already_member} ->
        {:error,
         changeset_for_errors(%{
           "invitation.email": "User is already member of the organization."
         })}

      err ->
        err
    end
  end

  defp fetch_user_by_email(email) do
    case Buildel.Accounts.get_user_by_email(email) do
      nil -> {:ok, nil}
      user -> {:ok, user}
    end
  end

  defp verify_existing_membership(nil, _organization_id) do
    {:ok, nil}
  end

  defp verify_existing_membership(%Buildel.Accounts.User{} = user, organization_id) do
    case Organizations.check_membership(user, organization_id) do
      {:ok, :not_found} -> {:ok, user.id}
      {:ok, :found} -> {:error, :user_already_member}
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
