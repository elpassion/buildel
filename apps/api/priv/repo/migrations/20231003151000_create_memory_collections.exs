defmodule Buildel.Repo.Migrations.CreateMemoryCollections do
  use Ecto.Migration

  def change do
    create table(:memory_collections) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
      add :collection_name, :string, null: false

      timestamps()
    end

    execute(fn ->
      repo().delete_all("memories")
    end)

    alter table(:memories) do
      add :memory_collection_id, references(:memory_collections, on_delete: :delete_all), null: false
    end

    create index(:memory_collections, [:organization_id])
  end
end
