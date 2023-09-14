defmodule Buildel.Repo.Migrations.CreateMemories do
  use Ecto.Migration

  def change do
    create table(:memories) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
      add :file_name, :string, null: false
      add :file_size, :integer, null: false
      add :file_type, :string, null: false

      add :collection_name, :string, null: false

      timestamps()
    end

    create index(:memories, [:organization_id])
  end
end
