defmodule Buildel.SecretsFixtures do
  import Buildel.OrganizationsFixtures

  def secret_fixture(attrs \\ %{}) do
    organization =
      case attrs[:organization_id] do
        nil -> organization_fixture()
        _ -> Buildel.Organizations.get_organization!(attrs[:organization_id])
      end

    params =
      attrs
      |> Enum.into(%{
        organization_id: organization.id,
        name: "some name",
        value: "some value"
      })

    {:ok, secret} = Buildel.Organizations.create_organization_secret(organization, params)

    secret
  end
end
