defmodule Buildel.Experiments.Runs.Run do
  alias Buildel.Experiments.Experiment
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  schema "experiment_runs" do
    belongs_to(:experiment, Experiment)
    field(:status, Ecto.Enum, values: [created: 0, running: 1, finished: 2], default: :created)

    timestamps()
  end

  @doc false
  def changeset(run, attrs) do
    run
    |> cast(attrs, [:experiment_id])
    |> validate_required([:experiment_id])
    |> assoc_constraint(:experiment)
    |> prepare_changes(fn changeset ->
      if experiment_id = get_change(changeset, :experiment_id) do
        query = from Experiment, where: [id: ^experiment_id]
        changeset.repo.update_all(query, inc: [runs_count: 1])
      end

      changeset
    end)
  end
end
