defmodule Buildel.Secrets.Secret do
  use Ecto.Schema
  import Ecto.Query
  import Ecto.Changeset

  schema "secrets" do
    field(:name, :string)
    field(:alias, :string)

    field(:value, Buildel.Encrypted.Binary)
    field(:value_hash, Cloak.Ecto.SHA256)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  def changeset(secret, attrs \\ %{}) do
    secret
    |> cast(attrs, [:organization_id, :name, :value, :alias])
    |> validate_required([:organization_id, :name, :value])
    |> assoc_constraint(:organization)
    |> unique_constraint([:organization_id, :name])
    |> prepare_changes(fn changeset ->
      organization_id = attrs.organization_id

      case get_change(changeset, :alias) do
        nil ->
          changeset

        alias ->
          changeset.repo.update_all(
            from(s in Buildel.Secrets.Secret,
              where: s.alias == ^alias and s.organization_id == ^organization_id
            ),
            set: [alias: nil]
          )

          changeset
      end
    end)
    |> put_hashed_fields()
  end

  defp put_hashed_fields(changeset) do
    changeset
    |> put_change(:value_hash, get_field(changeset, :value))
  end
end
