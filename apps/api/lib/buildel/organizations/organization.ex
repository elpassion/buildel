defmodule Buildel.Organizations.Organization do
  use Ecto.Schema
  import Ecto.Changeset

  schema "organizations" do
    field(:name, :string)

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
    |> cast(attrs, [:name])
    |> cast_assoc(:memberships)
    |> validate_required([:name])
  end
end
