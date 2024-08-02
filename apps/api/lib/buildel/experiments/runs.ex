defmodule Buildel.Experiments.Runs do
  alias Buildel.Experiments.Experiment
  alias Buildel.Experiments.Runs.Run
  import Ecto.Query, warn: false
  alias Buildel.Repo

  def list_experiment_runs(%Experiment{} = experiment, pagination_params) do
    offset = pagination_params.page * pagination_params.per_page

    results =
      from(r in Run,
        where: r.experiment_id == ^experiment.id,
        order_by: [desc: r.inserted_at]
      )
      |> limit(^pagination_params.per_page)
      |> offset(^offset)
      |> Repo.all()

    {:ok, results, experiment.runs_count}
  end
end