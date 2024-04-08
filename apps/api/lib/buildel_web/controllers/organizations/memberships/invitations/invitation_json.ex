defmodule BuildelWeb.OrganizationMembershipInvitationJSON do
  alias Buildel.Organizations.Invitation

  def index(%{invitations: invitations}) do
    %{data: for(invitation <- invitations, do: data(invitation))}
  end

  def show(%{invitation: invitation}) do
    %{data: data(invitation)}
  end

  defp data(%Invitation{} = invitation) do
    %{
      id: invitation.id,
      email: invitation.email,
      expires_at: invitation.expires_at
    }
  end
end
