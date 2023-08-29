defmodule BuildelWeb.RunJSON do
  alias Buildel.Pipelines.Run

  def index(%{runs: runs}) do
    %{data: for(run <- runs, do: data(run))}
  end

  def show(%{run: run}) do
    %{data: data(run)}
  end

  defp data(%Run{} = run) do
    %{
      id: run.id,
      pipeline_id: run.pipeline_id,
      status: run.status
    }
  end
end
