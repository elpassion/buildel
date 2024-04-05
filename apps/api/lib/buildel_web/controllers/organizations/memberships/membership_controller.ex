defmodule BuildelWeb.OrganizationMembershipController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, %{"organization_id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         memberships <- Organizations.list_organization_memberships(organization) do
      render(conn, :index, memberships: memberships)
    end
  end

  defparams :create do
    required(:membership, :map) do
      required(:user_email, :string)
    end
  end

  def create(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{membership: %{user_email: user_email}}} <- validate(:create, params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, user} <- fetch_user_by_email(user_email),
         {:ok, membership} <-
           Organizations.create_membership(%{organization_id: organization.id, user_id: user.id}) do
      conn
      |> put_status(:created)
      |> render(:show, membership: membership)
    else
      {:error, :not_found} ->
        {:error,
         changeset_for_errors(%{
           "membership.user_email": "User with specified email does not exist."
         })}

      {:error, %Ecto.Changeset{errors: [organization_id: {"has already been taken", _}]}} ->
        {:error,
         changeset_for_errors(%{
           "membership.user_email": "User is already a member of the organization."
         })}

      err ->
        err
    end
  end

  defp fetch_user_by_email(email) do
    case Buildel.Accounts.get_user_by_email(email) do
      nil -> {:error, :not_found}
      user -> {:ok, user}
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
