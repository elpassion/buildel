defmodule Buildel.Repo.Migrations.CreateMemoryCollectionCosts do
  use Ecto.Migration

  def change do
    create table(:memory_collection_costs) do
      add :cost_id, references(:costs, on_delete: :nothing), null: false
      add :memory_collection_id, references(:memory_collections, on_delete: :nothing), null: false

      add :cost_type, :integer, null: false
      add :description, :string

      timestamps()
    end
  end
end
