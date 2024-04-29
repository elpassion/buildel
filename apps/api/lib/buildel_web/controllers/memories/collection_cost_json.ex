defmodule BuildelWeb.CollectionCostsJSON do
  alias Buildel.Memories.MemoryCollectionCost
  alias Buildel.Memories.MemoryCollectionCosts

  def index(%{
        collection_costs: collection_costs,
        params: %MemoryCollectionCosts.Params{} = params,
        total: total
      }) do
    %{
      data: for(collection_cost <- collection_costs, do: data(collection_cost)),
      meta: %{
        total: total,
        page: params.page,
        per_page: params.per_page
      }
    }
  end

  def show(%{collection_cost: collection_cost}) do
    %{data: data(collection_cost)}
  end

  defp data(%MemoryCollectionCost{} = collection_cost) do
    %{
      id: collection_cost.cost.id,
      amount: collection_cost.cost.amount,
      input_tokens: collection_cost.cost.input_tokens,
      output_tokens: collection_cost.cost.output_tokens,
      description: collection_cost.description,
      cost_type: collection_cost.cost_type,
      created_at: collection_cost.inserted_at
    }
  end
end
