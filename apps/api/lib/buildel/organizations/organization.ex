defmodule Buildel.Organizations.Organization do
  use Ecto.Schema
  import Ecto.Changeset

  schema "organizations" do
    field(:name, :string)

    field(:api_key, Buildel.Encrypted.Binary)
    field(:api_key_hash, Cloak.Ecto.SHA256)

    has_many(:memberships, Buildel.Organizations.Membership)
    has_many(:api_keys, Buildel.ApiKeys.ApiKey)
    has_many(:secrets, Buildel.Secrets.Secret)
    has_many(:memories, Buildel.Memories.Memory)
    many_to_many(:members, Buildel.Accounts.User, join_through: Buildel.Organizations.Membership)
    timestamps()
  end

  @doc false
  def changeset(organization, attrs) do
    organization
    |> cast(attrs, [:name, :api_key])
    |> cast_assoc(:memberships)
    |> validate_required([:name, :api_key])
    |> put_hashed_fields()
  end

  defp put_hashed_fields(changeset) do
    changeset
    |> put_change(:api_key_hash, get_field(changeset, :api_key))
  end
end
