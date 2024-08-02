defmodule Buildel.Experiments.Runs.RunRowRun do
  alias Buildel.Experiments.Runs.Run
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query

  schema "experiment_run_row_runs" do
    belongs_to(:experiment_run, Run)
    belongs_to(:dataset_row, Buildel.Datasets.DatasetRow)
    belongs_to(:run, Buildel.Pipelines.Run)

    field(:data, :map)

    timestamps()
  end

  @doc false
  def changeset(run_row_run, attrs) do
    run_row_run
    |> cast(attrs, [:experiment_run_id, :dataset_row_id, :run_id])
    |> validate_required([:experiment_run_id, :dataset_row_id, :run_id])
    |> assoc_constraint(:experiment_run)
    |> assoc_constraint(:dataset_row)
    |> assoc_constraint(:run)
  end

  def finish(run_row_run, data) do
    run_row_run
    |> cast(%{data: data}, [:data])
    |> prepare_changes(fn changeset ->
      run_id = run_row_run.experiment_run_id

      query =
        from(r in Run,
          as: :run,
          where: [id: ^run_id],
          where:
            not exists(
              from(rrr in __MODULE__,
                where:
                  parent_as(:run).id == rrr.run_id and is_nil(rrr.data) and
                    rrr.id != ^run_row_run.id
              )
            )
        )

      changeset.repo.update_all(query, set: [status: :finished])

      changeset
    end)
    |> Buildel.Repo.update()
  end

  def status(run_row_run) do
    case run_row_run.run do
      %Buildel.Pipelines.Run{status: :finished} -> :finished
      %Buildel.Pipelines.Run{status: :running} -> :running
      _ -> :created
    end
  end
end
