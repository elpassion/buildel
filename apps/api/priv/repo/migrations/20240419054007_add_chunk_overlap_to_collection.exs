defmodule Buildel.Repo.Migrations.AddChunkOverlapToCollection do
  use Ecto.Migration

  def change do
    alter table(:memory_collections) do
      add :chunk_overlap, :integer, default: 0, null: false
    end
  end
end
