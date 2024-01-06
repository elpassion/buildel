defmodule BuildelWeb.OrganizationMembershipJSON do
  alias Buildel.Organizations.Membership

  def index(%{memberships: memberships}) do
    %{data: for(membership <- memberships, do: data(membership))}
  end

  def show(%{membership: membership}) do
    %{data: data(membership)}
  end

  defp data(%Membership{user: user} = membership) do
    %{
      id: membership.id,
      organization_id: membership.organization_id,
      created_at: membership.inserted_at,
      updated_at: membership.updated_at,
      user: %{
        id: user.id,
        email: user.email
      }
    }
  end
end
