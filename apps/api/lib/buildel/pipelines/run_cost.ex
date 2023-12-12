defmodule Buildel.Pipelines.RunCost do
  use Ecto.Schema
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
  end
end
