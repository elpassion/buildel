defmodule BuildelWeb.ExperimentRunJSON do
  alias Buildel.Experiments.Runs.Run

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

  defp data(%Run{} = run) do
    %{
      id: run.id,
      status: run.status,
      runs_count: run.runs_count,
      columns: %{
        inputs: run.inputs,
        outputs: run.outputs
      },
      created_at: run.inserted_at,
      evaluations_avg: run.evaluations_avg
    }
  end
end
