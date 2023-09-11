defmodule Buildel.ApiKeys.ApiKey do
  use Ecto.Schema
  import Ecto.Changeset

  schema "api_keys" do
    field(:key, :string)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  def with_random_key() do
    %__MODULE__{key: :crypto.strong_rand_bytes(32) |> Base.encode64()}
  end

  def changeset(api_key, attrs) do
    api_key
    |> cast(attrs, [:organization_id, :key])
    |> validate_required([:organization_id, :key])
    |> unique_constraint(:key)
    |> assoc_constraint(:organization)
  end
end
