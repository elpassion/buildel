defmodule BuildelWeb.OrganizationCostsJSON do
  def index(%{costs: costs, params: %Buildel.OrganizationCosts.Params{} = params, total: total}) do
    %{
      data: for(cost <- costs, do: data(cost)),
      meta: %{
        total: total,
        page: params.page,
        per_page: params.per_page
      }
    }
  end

  defp data(%Buildel.OrganizationCosts.OrganizationCost{} = cost) do
    %{
      id: cost.id,
      amount: cost.amount,
      input_tokens: cost.input_tokens,
      output_tokens: cost.output_tokens,
      created_at: cost.inserted_at,
      description: cost.description,
      type: cost.type,
      pipeline_id: cost.pipeline_id,
      run_id: cost.run_id,
      memory_collection_id: cost.memory_collection_id,
      memory_collection_name: cost.memory_collection_name
    }
  end
end
