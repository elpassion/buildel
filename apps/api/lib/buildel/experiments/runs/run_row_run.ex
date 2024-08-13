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
    field(:evaluation_avg, :float)

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
    |> prepare_changes(fn changeset ->
      if experiment_run_id = get_change(changeset, :experiment_run_id) do
        query = from Run, where: [id: ^experiment_run_id]
        changeset.repo.update_all(query, inc: [runs_count: 1])
      end

      changeset
    end)
  end

  def finish(run_row_run, data) do
    run = from(r in Run, where: r.id == ^run_row_run.experiment_run_id) |> Buildel.Repo.one()

    evaluations =
      Enum.filter(data, fn {key, value} ->
        String.contains?(key, run.outputs) && is_integer(value)
      end)

    evaluation_avg =
      case length(evaluations) do
        0 ->
          0

        _ ->
          Enum.reduce(evaluations, 0, fn {_, value}, acc -> acc + value end) / length(evaluations)
      end

    run_row_run
    |> cast(%{data: data, evaluation_avg: evaluation_avg}, [:data, :evaluation_avg])
    |> prepare_changes(fn changeset ->
      run_id = run_row_run.experiment_run_id
      empty_map = %{}

      query =
        if run.runs_count === 1 do
          from(r in Run,
            as: :run,
            where: [id: ^run_id]
          )
        else
          from(r in Run,
            as: :run,
            where: [id: ^run_id],
            where:
              not exists(
                from(rrr in __MODULE__,
                  where:
                    parent_as(:run).id == rrr.experiment_run_id and rrr.data == ^empty_map and
                      rrr.id != ^run_row_run.id
                )
              )
          )
        end

      status_update = changeset.repo.update_all(query, set: [status: :finished])

      case status_update do
        {0, _} ->
          nil

        {1, _} ->
          {count, sum} =
            from(rrr in __MODULE__,
              where:
                rrr.experiment_run_id == ^run_row_run.experiment_run_id and
                  not is_nil(rrr.evaluation_avg),
              select: {count(rrr.evaluation_avg), sum(rrr.evaluation_avg)}
            )
            |> Buildel.Repo.one()

          evaluations_avg =
            case sum do
              nil -> 0
              sum -> (sum + evaluation_avg) / (count + 1)
            end

          columns_avg = get_columns_avg(run_row_run.experiment_run_id, evaluations)

          changeset.repo.update_all(query,
            set: [evaluations_avg: evaluations_avg, columns_avg: columns_avg]
          )
      end

      changeset
    end)
    |> Buildel.Repo.update()
  end

  defp get_columns_avg(experiment_run_id, evaluations) do
    empty_map = %{}

    result =
      from(rrr in __MODULE__,
        where:
          rrr.experiment_run_id == ^experiment_run_id and
            rrr.data != ^empty_map,
        select: rrr.data
      )
      |> Buildel.Repo.all()

    Enum.reduce(evaluations, %{}, fn {key, value}, acc ->
      sum = Enum.sum(Enum.map(result, fn data -> data[key] end)) + value
      count = Enum.count(result) + 1

      Map.put(acc, key, sum / count)
    end)
  end

  def status(run_row_run) do
    case run_row_run.run do
      %Buildel.Pipelines.Run{status: :finished} -> :finished
      %Buildel.Pipelines.Run{status: :running} -> :running
      _ -> :created
    end
  end
end
