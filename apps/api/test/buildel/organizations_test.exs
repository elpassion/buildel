defmodule Buildel.OrganizationsTest do
  alias Buildel.ApiKeys.ApiKey
  use Buildel.DataCase

  alias Buildel.Organizations
  alias Buildel.Accounts

  describe "organizations" do
    alias Buildel.Organizations.Organization

    import Buildel.OrganizationsFixtures
    import Buildel.AccountsFixtures

    @invalid_attrs %{name: nil}

    test "list_user_organizations/1 returns all organizations a user is member of" do
      _organization = organization_fixture()
      membership = membership_fixture()

      user_organization =
        membership |> Map.get(:organization_id) |> Organizations.get_organization!()

      user_id = membership |> Map.get(:user_id)
      user = user_id |> Accounts.get_user!()
      assert Organizations.list_user_organizations(user) == [user_organization]
    end

    test "get_organization!/1 returns the organization with given id" do
      organization = organization_fixture()
      assert Organizations.get_organization!(organization.id) == organization
    end

    test "create_organization/1 with valid data creates a organization" do
      user = user_fixture()
      valid_attrs = %{name: "some name", user_id: user.id}

      assert {:ok, %Organization{} = organization} =
               Organizations.create_organization(valid_attrs)

      assert organization.name == "some name"
    end

    test "create_organization/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Organizations.create_organization(@invalid_attrs)
    end

    test "update_organization/2 with valid data updates the organization" do
      organization = organization_fixture()
      update_attrs = %{name: "some updated name"}

      assert {:ok, %Organization{} = organization} =
               Organizations.update_organization(organization, update_attrs)

      assert organization.name == "some updated name"
    end

    test "update_organization/2 with invalid data returns error changeset" do
      organization = organization_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Organizations.update_organization(organization, @invalid_attrs)

      assert organization == Organizations.get_organization!(organization.id)
    end

    test "delete_organization/1 deletes the organization" do
      organization = organization_fixture()
      assert {:ok, %Organization{}} = Organizations.delete_organization(organization)
      assert_raise Ecto.NoResultsError, fn -> Organizations.get_organization!(organization.id) end
    end

    test "change_organization/1 returns a organization changeset" do
      organization = organization_fixture()
      assert %Ecto.Changeset{} = Organizations.change_organization(organization)
    end
  end

  describe "memberships" do
    alias Buildel.Organizations.Membership

    import Buildel.OrganizationsFixtures

    @invalid_attrs %{
      organization_id: "not",
      user_id: "existing"
    }

    test "list_memberships/0 returns all memberships" do
      membership = membership_fixture()
      assert membership in Organizations.list_memberships()
    end

    test "list_organization_members/1 returns all organization members" do
      membership = membership_fixture()

      assert (membership |> Map.get(:user)) in Organizations.list_organization_members(
               membership
               |> Map.get(:organization_id)
             )
    end

    test "get_membership!/1 returns the membership with given id" do
      membership = membership_fixture()
      assert Organizations.get_membership!(membership.id) == membership
    end

    test "create_membership/1 with valid data creates a membership" do
      valid_attrs = valid_membership_attributes()

      assert {:ok, %Membership{} = membership} = Organizations.create_membership(valid_attrs)
      assert membership.organization_id == valid_attrs.organization_id
      assert membership.user_id == valid_attrs.user_id
    end

    test "create_membership/1 with invalid data returns error changeset" do
      assert {:error, %Ecto.Changeset{}} = Organizations.create_membership(@invalid_attrs)
    end

    test "update_membership/2 with valid data updates the membership" do
      membership = membership_fixture()
      another_organization = organization_fixture()
      update_attrs = %{organization_id: another_organization.id}

      assert {:ok, %Membership{} = membership} =
               Organizations.update_membership(membership, update_attrs)

      assert membership.organization_id == update_attrs.organization_id
    end

    test "update_membership/2 with invalid data returns error changeset" do
      membership = membership_fixture()

      assert {:error, %Ecto.Changeset{}} =
               Organizations.update_membership(membership, @invalid_attrs)

      assert membership == Organizations.get_membership!(membership.id)
    end

    test "delete_membership/1 deletes the membership" do
      membership = membership_fixture()
      assert {:ok, %Membership{}} = Organizations.delete_membership(membership)
      assert_raise Ecto.NoResultsError, fn -> Organizations.get_membership!(membership.id) end
    end

    test "change_membership/1 returns a membership changeset" do
      membership = membership_fixture()
      assert %Ecto.Changeset{} = Organizations.change_membership(membership)
    end
  end

  describe "api_keys" do
    import Buildel.OrganizationsFixtures

    test "list_organization_api_keys/1 returns all organization api keys" do
      organization = organization_fixture()
      organization_id = organization.id
      _another_organization = organization_fixture()

      assert [%ApiKey{organization_id: ^organization_id}] =
               Organizations.list_organization_api_keys(organization)
    end
  end
end
