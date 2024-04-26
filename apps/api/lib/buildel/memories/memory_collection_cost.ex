defmodule Buildel.Memories.MemoryCollectionCost do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memory_collection_costs" do
    field(:cost_type, Ecto.Enum, values: [file_upload: 0, query: 1])
    field(:description, :string)

    belongs_to(:cost, Buildel.Costs.Cost)
    belongs_to(:memory_collection, Buildel.Memories.MemoryCollection)

    timestamps()
  end

  def changeset(memory_collection_cost, attrs) do
    memory_collection_cost
    |> cast(attrs, [
      :cost_type,
      :cost_id,
      :description,
      :memory_collection_id
    ])
    |> validate_required([
      :cost_type,
      :cost_id,
      :memory_collection_id
    ])
    |> assoc_constraint(:cost)
    |> assoc_constraint(:memory_collection)
  end
end
