defmodule Buildel.Organizations do
  import Ecto.Query, warn: false
  alias Buildel.Repo

  alias Buildel.Organizations.{Organization, Membership}
  alias Buildel.Accounts.User
  alias Buildel.ApiKeys.ApiKey
  alias Buildel.Secrets.Secret

  def list_user_organizations(%User{} = user) do
    user |> Repo.preload(:organizations) |> Map.get(:organizations)
  end

  def get_user_organization(%User{} = user, organization_id) when is_binary(organization_id) do
    case Buildel.Utils.parse_id(organization_id) do
      {:ok, organization_id} -> get_user_organization(user, organization_id)
      error -> error
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

  def get_organization_by_api_key(api_key) do
    case Repo.get_by(Organization, api_key_hash: api_key) do
      nil ->
        {:error, :not_found}

      %Organization{} = organization ->
        {:ok, organization}
    end
  end

  def reset_organization_api_key(%Organization{} = organization) do
    organization
    |> Organization.changeset(%{
      api_key: :crypto.strong_rand_bytes(32) |> Base.encode64()
    })
    |> Buildel.Repo.update()
  end

  def create_organization(attrs \\ %{}) do
    attrs = attrs |> Map.put(:api_key, :crypto.strong_rand_bytes(32) |> Base.encode64())

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

  def get_member(%Organization{} = organization) do
    case Repo.get_by(Membership, organization_id: organization.id) do
      nil -> {:error, :not_found}
      %Membership{} = membership -> {:ok, membership |> Repo.preload(:user) |> Map.get(:user)}
    end
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

  def get_organization_secret(%Organization{} = organization, secret_name) do
    case Repo.get_by(Secret, name: secret_name, organization_id: organization.id) do
      nil -> {:error, :not_found}
      %Secret{} = secret -> {:ok, secret}
    end
  end

  def list_organization_secrets(%Organization{} = organization) do
    organization |> Repo.preload(:secrets) |> Map.get(:secrets)
  end

  def create_organization_secret(%Organization{} = organization, attrs \\ %{}) do
    case %Secret{}
         |> Secret.changeset(attrs |> Map.put(:organization_id, organization.id))
         |> Repo.insert() do
      {:ok, secret} -> {:ok, secret |> Repo.preload(:organization)}
      {:error, changeset} -> {:error, changeset}
    end
  end

  def update_organization_secret(%Organization{} = organization, attrs \\ %{}) do
    with %Secret{} = secret <-
           Repo.get_by(Secret, name: attrs.name, organization_id: organization.id),
         {:ok, secret} <- secret |> Secret.changeset(attrs) |> Repo.update() do
      {:ok, secret |> Repo.preload(:organization)}
    end
  end

  def delete_organization_secret(%Organization{} = organization, secret_name) do
    case Repo.get_by(Secret, name: secret_name, organization_id: organization.id) do
      nil -> {:error, :not_found}
      %Secret{} = secret -> {:ok, secret |> Repo.delete()}
    end
  end
end
