defmodule Buildel.Secrets.Secret do
  use Ecto.Schema
  import Ecto.Changeset

  schema "secrets" do
    field(:name, :string)

    field(:value, Buildel.Encrypted.Binary)
    field(:value_hash, Cloak.Ecto.SHA256)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  def changeset(secret, attrs \\ %{}) do
    secret
    |> cast(attrs, [:organization_id, :name, :value])
    |> validate_required([:organization_id, :name, :value])
    |> assoc_constraint(:organization)
    |> put_hashed_fields()
  end

  defp put_hashed_fields(changeset) do
    changeset
    |> put_change(:value_hash, get_field(changeset, :value))
  end
end
