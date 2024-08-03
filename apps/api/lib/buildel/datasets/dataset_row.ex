defmodule Buildel.Datasets.DatasetRow do
  alias Buildel.Datasets.Dataset
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

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
    |> prepare_changes(fn
      %Ecto.Changeset{action: :insert} = changeset ->
        if dataset_id = get_change(changeset, :dataset_id) do
          query = from Dataset, where: [id: ^dataset_id]
          changeset.repo.update_all(query, inc: [rows_count: 1])
        end

        changeset

      changeset ->
        changeset
    end)
  end
end
