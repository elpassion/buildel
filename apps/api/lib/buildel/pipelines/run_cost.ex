defmodule Buildel.Pipelines.RunCost do
  use Ecto.Schema
  import Ecto.Changeset
  import Ecto.Query
  import Ecto.Changeset

  schema "run_costs" do
    belongs_to :run, Buildel.Pipelines.Run
    belongs_to :cost, Buildel.Costs.Cost
    field :description, :string

    timestamps()
  end

  def changeset(cost, attrs) do
    cost
    |> cast(attrs, [:description, :run_id, :cost_id])
    |> validate_required([:description, :run_id, :cost_id])
    |> assoc_constraint(:run)
    |> assoc_constraint(:cost)
    |> prepare_changes(fn changeset ->
      with run_id <- get_change(changeset, :run_id),
           cost_id <- get_change(changeset, :cost_id),
           cost <- Buildel.Repo.get(Buildel.Costs.Cost, cost_id) do
        query = from Buildel.Pipelines.Run, where: [id: ^run_id]
        changeset.repo.update_all(query, inc: [total_cost: cost.amount])
      else
        _ -> changeset
      end

      changeset
    end)
  end
end
