defmodule Buildel.CostsFixtures do
  require Ecto.Query

  def cost_fixture(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Pipelines.Run{} = run,
        date \\ nil
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
end
