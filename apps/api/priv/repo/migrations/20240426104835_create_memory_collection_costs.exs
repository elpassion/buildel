defmodule Buildel.Repo.Migrations.CreateMemoryCollectionCosts do
  use Ecto.Migration

  def change do
    create table(:memory_collection_costs) do
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false

      add :memory_collection_id, references(:memory_collections, on_delete: :delete_all),
        null: false

      add :cost_type, :integer, null: false
      add :file_name, :string
      add :query, :string
      add :total_tokens, :integer, null: false

      timestamps()
    end
  end
end
