defmodule Buildel.Organizations do
  import Ecto.Query, warn: false
  alias Buildel.Repo

  alias Buildel.Organizations.{Organization, Membership}
  alias Buildel.Accounts.User
  alias Buildel.ApiKeys.ApiKey

  def list_user_organizations(%User{} = user) do
    user |> Repo.preload(:organizations) |> Map.get(:organizations)
  end

  def get_user_organization(%User{} = user, organization_id) when is_binary(organization_id) do
    case Integer.parse(organization_id) do
      {organization_id, _} when is_number(organization_id) ->
        get_user_organization(user, organization_id)

      :error ->
        {:error, :bad_request}
    end
  end

  def get_user_organization(%User{} = user, organization_id) do
    case list_user_organizations(user)
         |> Enum.find(fn organization -> organization.id == organization_id end) do
      nil -> {:error, :not_found}
      organization -> {:ok, organization}
    end
  end

  def get_organization!(id), do: Repo.get!(Organization, id)

  def create_organization(attrs \\ %{}) do
    case Ecto.Multi.new()
         |> Ecto.Multi.insert(:organization, Organization.changeset(%Organization{}, attrs))
         |> Ecto.Multi.insert(:membership, fn %{organization: %{id: organization_id}} ->
           %Membership{}
           |> Membership.changeset(%{organization_id: organization_id, user_id: attrs.user_id})
         end)
         |> Ecto.Multi.insert(:api_key, fn %{organization: %{id: organization_id}} ->
           ApiKey.with_random_key()
           |> ApiKey.changeset(%{organization_id: organization_id})
         end)
         |> Repo.transaction() do
      {:ok, %{organization: organization}} ->
        {:ok, organization}

      {:error, :organization, changeset, _actions} ->
        {:error, changeset}
    end
  end

  def update_organization(%Organization{} = organization, attrs) do
    organization
    |> Organization.changeset(attrs)
    |> Repo.update()
  end

  def delete_organization(%Organization{} = organization) do
    Repo.delete(organization)
  end

  def change_organization(%Organization{} = organization, attrs \\ %{}) do
    Organization.changeset(organization, attrs)
  end

  def list_memberships do
    Repo.all(Membership) |> Repo.preload([:organization, :user])
  end

  def list_organization_members(organization_id) do
    Organization |> Repo.get(organization_id) |> Repo.preload(:members) |> Map.get(:members)
  end

  def list_organization_memberships(organization_id) do
    Organization
    |> Repo.get(organization_id)
    |> Repo.preload(memberships: [:user])
    |> Map.get(:memberships)
  end

  def get_membership!(id), do: Repo.get!(Membership, id) |> Repo.preload([:organization, :user])

  def create_membership(attrs \\ %{}) do
    case %Membership{}
         |> Membership.changeset(attrs)
         |> Repo.insert() do
      {:ok, membership} -> {:ok, membership |> Repo.preload([:organization, :user])}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def update_membership(%Membership{} = membership, attrs) do
    case membership
         |> Membership.changeset(attrs)
         |> Repo.update() do
      {:ok, membership} -> {:ok, membership |> Repo.preload([:organization, :user])}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def delete_membership(%Membership{} = membership) do
    Repo.delete(membership)
  end

  def change_membership(%Membership{} = membership, attrs \\ %{}) do
    Membership.changeset(membership, attrs)
  end

  def list_organization_api_keys(%Organization{} = organization) do
    organization |> Repo.preload(:api_keys) |> Map.get(:api_keys)
  end
end
