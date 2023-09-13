defmodule Buildel.Memories.Memory do
  use Ecto.Schema
  import Ecto.Changeset

  schema "memories" do
    field(:file_name, :string)
    field(:file_size, :integer)
    field(:file_type, :string)

    field(:collection_name, :string)

    belongs_to(:organization, Buildel.Organizations.Organization)

    timestamps()
  end

  def changeset(memory, attrs) do
    memory
    |> cast(attrs, [:organization_id, :file_name, :file_size, :file_type, :collection_name])
    |> validate_required([:organization_id, :file_name, :file_size, :file_type, :collection_name])
    |> unique_constraint([:collection_name, :organization_id])
    |> assoc_constraint(:organization)
  end
end
