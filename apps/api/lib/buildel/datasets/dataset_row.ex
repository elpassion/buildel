defmodule Buildel.Datasets.DatasetRow do
  use Ecto.Schema
  import Ecto.Changeset

  schema "dataset_rows" do
    field(:index, :integer)
    field(:data, :map)

    belongs_to(:dataset, Buildel.Datasets.Dataset)

    timestamps()
  end

  @doc false
  def changeset(row, attrs) do
    row
    |> cast(attrs, [:index, :data, :dataset_id])
    |> validate_required([:data, :dataset_id])
    |> assoc_constraint(:dataset)
  end
end
