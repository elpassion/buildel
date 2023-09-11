defmodule BuildelWeb.OrganizationJSON do
  alias Buildel.Organizations.Organization

  def index(%{organizations: organizations}) do
    %{data: for(organization <- organizations, do: data(organization))}
  end

  def show(%{organization: organization}) do
    %{data: data(organization)}
  end

  def keys(%{keys: keys}) do
    %{data: for(key <- keys, do: key_data(key))}
  end

  defp data(%Organization{} = organization) do
    %{
      id: organization.id,
      name: organization.name
    }
  end

  defp key_data(%Buildel.ApiKeys.ApiKey{} = key) do
    %{
      key: key.key
    }
  end
end
