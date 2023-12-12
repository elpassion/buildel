defmodule BuildelWeb.OrganizationPipelineRunCostJSON do
  alias Buildel.Pipelines.RunCost

  def show(%{run_cost: run_cost}) do
    %{data: data(run_cost)}
  end

  defp data(%RunCost{} = run_cost) do
    %{
      id: run_cost.cost.id,
      amount: run_cost.cost.amount,
      description: run_cost.description,
      created_at: run_cost.inserted_at
    }
  end
end
