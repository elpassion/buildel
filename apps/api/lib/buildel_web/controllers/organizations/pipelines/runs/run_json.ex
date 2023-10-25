defmodule BuildelWeb.OrganizationPipelineRunJSON do
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
      status: run.status,
      created_at: run.inserted_at,
      config: run.config
    }
  end
end
