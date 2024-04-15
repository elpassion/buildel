defmodule Buildel.Repo.Migrations.AddChunkSizeToCollection do
  use Ecto.Migration

  def change do
    alter table(:memory_collections) do
      add :chunk_size, :integer, default: 1000, null: false
    end
  end
end
