defmodule BuildelWeb.ExperimentRunRunJSON do
  alias Buildel.Experiments.Runs.RunRowRun

  def index(%{runs: runs, pagination_params: pagination_params, total: total}) do
    %{
      data: for(run <- runs, do: data(run)),
      meta: %{
        total: total,
        page: pagination_params.page,
        per_page: pagination_params.per_page
      }
    }
  end

  def show(%{run: run}) do
    %{data: data(run)}
  end

  defp data(%RunRowRun{} = run) do
    %{
      id: run.id,
      status: run |> RunRowRun.status(),
      created_at: run.inserted_at,
      data: run.data,
      run_id: run.run_id,
      pipeline_id: run.run.pipeline_id,
      experiment_run_id: run.experiment_run_id,
      dataset_id: run.dataset_row.dataset_id,
      dataset_row_id: run.dataset_row_id
    }
  end
end
