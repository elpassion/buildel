defmodule Buildel.Memories.MemoryCollectionCost do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memory_collection_costs" do
    field(:cost_type, Ecto.Enum, values: [file_upload: 0, query: 1])
    field(:file_name, :string)
    field(:query, :string)
    field(:total_tokens, :integer)

    belongs_to(:organization, Buildel.Organizations.Organization)
    belongs_to(:memory_collection, Buildel.Memories.MemoryCollection)

    timestamps()
  end

  def changeset(memory_collection_cost, attrs) do
    memory_collection_cost
    |> cast(attrs, [
      :cost_type,
      :organization_id,
      :file_name,
      :query,
      :total_tokens,
      :memory_collection_id
    ])
    |> validate_required([
      :cost_type,
      :organization_id,
      :total_tokens,
      :memory_collection_id
    ])
    |> assoc_constraint(:organization)
    |> assoc_constraint(:memory_collection)
  end
end
