defmodule Buildel.CostsFixtures do
  require Ecto.Query

  def cost_fixture(
        organization,
        run,
        date \\ nil
      )

  def cost_fixture(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Pipelines.Run{} = run,
        date
      ) do
    {:ok, cost} =
      Buildel.Organizations.create_organization_cost(organization, %{
        amount: Decimal.new("100.0"),
        input_tokens: 100,
        output_tokens: 100
      })

    {:ok, run_cost} =
      Buildel.Pipelines.create_run_cost(run, cost, %{
        description: "foo"
      })

    if date do
      Ecto.Query.from(c in Buildel.Costs.Cost,
        where: c.id == ^cost.id,
        update: [set: [inserted_at: ^date]]
      )
      |> Buildel.Repo.update_all([])
    end

    %{run_cost: run_cost, cost: cost}
  end

  def cost_fixture(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Memories.MemoryCollection{} = collection,
        date
      ) do
    {:ok, cost} =
      Buildel.Organizations.create_organization_cost(organization, %{
        amount: Decimal.new("100.0"),
        input_tokens: 100,
        output_tokens: 0
      })

    {:ok, collection_cost} =
      Buildel.Memories.create_memory_collection_cost(collection, cost, %{
        cost_type: :query,
        description: "foo"
      })

    if date do
      Ecto.Query.from(c in Buildel.Costs.Cost,
        where: c.id == ^cost.id,
        update: [set: [inserted_at: ^date]]
      )
      |> Buildel.Repo.update_all([])

      Ecto.Query.from(c in Buildel.Memories.MemoryCollectionCost,
        where: c.cost_id == ^cost.id,
        update: [set: [inserted_at: ^date]]
      )
      |> Buildel.Repo.update_all([])
    end

    %{collection_cost: collection_cost, cost: cost}
  end
end
