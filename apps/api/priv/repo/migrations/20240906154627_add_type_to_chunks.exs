defmodule Buildel.Repo.Migrations.AddTypeToChunks do
  use Ecto.Migration

  def change do
    alter table(:vector_collection_chunks) do
      add :chunk_type, :string, null: false, default: "chunk"
    end
  end
end
