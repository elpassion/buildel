defmodule Buildel.Costs.Cost do
  use Ecto.Schema
  import Ecto.Changeset

  schema "costs" do
    belongs_to :organization, Buildel.Organizations.Organization
    field :amount, :decimal

    timestamps()
  end

  def changeset(cost, attrs) do
    cost
    |> cast(attrs, [:amount, :organization_id])
    |> validate_required([:amount])
    |> validate_number(:amount, greater_than: 0)
    |> assoc_constraint(:organization)
  end
end
