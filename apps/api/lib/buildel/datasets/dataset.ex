defmodule Buildel.Datasets.Dataset do
  use Ecto.Schema
  import Ecto.Changeset

  schema "datasets" do
    field(:name, :string)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  @doc false
  def changeset(dataset, attrs) do
    dataset
    |> cast(attrs, [:organization_id, :name])
    |> validate_required([:organization_id, :name])
    |> assoc_constraint(:organization)
  end
end
