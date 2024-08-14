defmodule Buildel.Experiments.Runs.Run do
  alias Buildel.Experiments.Runs.Run
  alias Buildel.Experiments.Experiment
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  schema "experiment_runs" do
    belongs_to(:experiment, Experiment)
    field(:status, Ecto.Enum, values: [created: 0, running: 1, finished: 2], default: :created)

    field(:inputs, {:array, :string})
    field(:outputs, {:array, :string})
    field(:evaluations_avg, :float)
    field(:columns_avg, :map)

    field(:runs_count, :integer, default: 0)

    timestamps()
  end

  @doc false
  def changeset(run, attrs) do
    run
    |> cast(attrs, [:experiment_id, :inputs, :outputs, :evaluations_avg, :columns_avg])
    |> validate_required([:experiment_id, :inputs, :outputs])
    |> validate_length(:inputs, min: 1)
    |> validate_length(:outputs, min: 1)
    |> assoc_constraint(:experiment)
    |> prepare_changes(fn changeset ->
      if experiment_id = get_change(changeset, :experiment_id) do
        query = from Experiment, where: [id: ^experiment_id]
        changeset.repo.update_all(query, inc: [runs_count: 1])
      end

      changeset
    end)
  end

  def start(run) do
    run |> update_status(:running) |> Buildel.Repo.update()
  end

  def finish(%Run{status: status} = run) when status != :finished do
    run |> update_status(:finished) |> Buildel.Repo.update()
  end

  def finish(run) do
    {:ok, run}
  end

  def update_status(run, :finished) do
    run
    |> cast(%{status: :finished, evaluations_avg: 0, columns_avg: %{}}, [
      :status,
      :evaluations_avg,
      :columns_avg
    ])
  end

  def update_status(run, status) do
    run |> cast(%{status: status}, [:status])
  end
end
