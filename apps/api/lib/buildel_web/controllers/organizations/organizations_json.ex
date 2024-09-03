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

  def organization_key(%{key: key}) do
    %{data: %{key: key}}
  end

  def key(%{key: key, hidden: hidden}) do
    %{data: key_data(key, hidden)}
  end

  defp data(%Organization{} = organization) do
    %{
      id: organization.id,
      name: organization.name,
      el_id: organization.el_id
    }
  end

  defp key_data(%Buildel.ApiKeys.ApiKey{} = key, hidden \\ true) do
    key_string =
      if hidden do
        hidden_key(key)
      else
        key.key
      end

    %{
      id: key.id,
      key: key_string,
      created_at: key.inserted_at
    }
  end

  defp hidden_key(key) do
    key.key |> String.slice(-4..-1) |> String.pad_leading(28, "*")
  end
end
