defmodule BuildelWeb.OrganizationJSON do
  alias Buildel.Organizations.Organization

  def index(%{organizations: organizations}) do
    %{data: for(organization <- organizations, do: data(organization))}
  end

  def show(%{organization: organization}) do
    %{data: data(organization)}
  end

  defp data(%Organization{} = organization) do
    %{
      id: organization.id
    }
  end
end
