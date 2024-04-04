defmodule Buildel.CostsFixtures do
  def cost_fixture(
        %Buildel.Organizations.Organization{} = organization,
        %Buildel.Pipelines.Run{} = run
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

    %{run_cost: run_cost, cost: cost}
  end
end
