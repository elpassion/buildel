defmodule Buildel.Memories.MemoryCollection do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memory_collections" do
    field(:collection_name, :string)
    field(:embeddings_api_type, :string)
    field(:embeddings_model, :string)
    field(:embeddings_secret_name, :string)

    belongs_to(:organization, Buildel.Organizations.Organization)
    has_many(:memories, Buildel.Memories.Memory)

    timestamps()
  end

  def changeset(memory_collection, attrs) do
    memory_collection
    |> cast(attrs, [
      :organization_id,
      :collection_name,
      :embeddings_api_type,
      :embeddings_model,
      :embeddings_secret_name
    ])
    |> validate_required([
      :organization_id,
      :collection_name,
      :embeddings_api_type,
      :embeddings_model,
      :embeddings_secret_name
    ])
    |> assoc_constraint(:organization)
  end
end
