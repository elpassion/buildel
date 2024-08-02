defmodule Buildel.Experiments.Experiment do
  use Ecto.Schema
  import Ecto.Changeset

  schema "experiments" do
    field(:name, :string)

    belongs_to(:organization, Buildel.Organizations.Organization)
    belongs_to(:pipeline, Buildel.Pipelines.Pipeline)
    belongs_to(:dataset, Buildel.Datasets.Dataset)

    has_many(:runs, Buildel.Experiments.Runs.Run, on_delete: :delete_all)
    field(:runs_count, :integer, default: 0)

    timestamps()
  end

  @doc false
  def changeset(dataset, attrs) do
    dataset
    |> cast(attrs, [:dataset_id, :pipeline_id, :organization_id, :name])
    |> validate_required([:dataset_id, :pipeline_id, :organization_id, :name])
    |> assoc_constraint(:organization)
    |> assoc_constraint(:pipeline)
    |> assoc_constraint(:dataset)
  end
end
