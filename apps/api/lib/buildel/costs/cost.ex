defmodule Buildel.Costs.Cost do
  use Ecto.Schema
  import Ecto.Changeset

  schema "costs" do
    belongs_to :organization, Buildel.Organizations.Organization
    field :amount, :decimal
    field :input_tokens, :integer
    field :output_tokens, :integer

    timestamps()
  end

  def changeset(cost, attrs) do
    cost
    |> cast(attrs, [:amount, :organization_id, :input_tokens, :output_tokens])
    |> validate_required([:amount, :input_tokens, :output_tokens])
    |> validate_number(:amount, greater_than: 0)
    |> assoc_constraint(:organization)
  end
end
