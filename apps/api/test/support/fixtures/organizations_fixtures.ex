defmodule Buildel.OrganizationsFixtures do
  def organization_fixture(attrs \\ %{}) do
    {:ok, organization} =
      attrs
      |> Enum.into(%{
        name: "some name",
        user_id: Buildel.AccountsFixtures.user_fixture().id
      })
      |> Buildel.Organizations.create_organization()
    organization
  end


  def valid_membership_attributes(attrs \\ %{}) do
    Enum.into(attrs, %{
      organization_id: organization_fixture(%{}).id,
      user_id: Buildel.AccountsFixtures.user_fixture(%{}).id
    })
  end

  def membership_fixture(attrs \\ %{}) do
    {:ok, membership} =
      attrs
      |> Enum.into(valid_membership_attributes())
      |> Buildel.Organizations.create_membership()

    membership |> Buildel.Repo.preload(:organization) |> Buildel.Repo.preload(:user)
  end
end
