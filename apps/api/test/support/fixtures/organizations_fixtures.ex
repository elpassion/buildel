defmodule Buildel.OrganizationsFixtures do
  def organization_fixture(attrs \\ %{}) do
    {:ok, organization} =
      attrs
      |> Enum.into(%{
        name: "some name",
        user_id: Buildel.AccountsFixtures.user_fixture().id
      })
      |> Buildel.Organizations.create_organization()

    organization |> Buildel.Repo.preload(:api_keys) |> Buildel.Repo.preload(:subscription)
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

  def invitation_fixture(attrs \\ %{}) do
    {encoded_token, invitation_token} =
      Buildel.Invitations.build_hashed_token("test@test.com", organization_fixture(%{}).id, nil)

    changeset =
      attrs
      |> Enum.into(%{
        email: invitation_token.email,
        token: invitation_token.token,
        expires_at: invitation_token.expires_at,
        organization_id: invitation_token.organization_id,
        user_id: invitation_token.user_id
      })

    invitation =
      %Buildel.Organizations.Invitation{}
      |> Buildel.Organizations.Invitation.changeset(changeset)
      |> Buildel.Repo.insert!()

    {invitation |> Buildel.Repo.preload(:organization) |> Buildel.Repo.preload(:user),
     encoded_token}
  end
end
