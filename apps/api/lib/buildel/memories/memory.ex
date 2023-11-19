defmodule Buildel.Memories.Memory do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memories" do
    field(:file_name, :string)
    field(:file_size, :integer)
    field(:file_type, :string)

    field(:collection_name, :string)

    field(:summary, :string)
    field(:summary_embedding, Pgvector.Ecto.Vector)

    belongs_to(:organization, Buildel.Organizations.Organization)
    belongs_to(:memory_collection, Buildel.Memories.MemoryCollection)

    timestamps()
  end

  def changeset(memory, attrs) do
    memory
    |> cast(attrs, [
      :organization_id,
      :file_name,
      :file_size,
      :file_type,
      :collection_name,
      :memory_collection_id
    ])
    |> validate_required([
      :organization_id,
      :file_name,
      :file_size,
      :file_type,
      :collection_name,
      :memory_collection_id
    ])
    |> assoc_constraint(:organization)
    |> assoc_constraint(:memory_collection)
  end
end
