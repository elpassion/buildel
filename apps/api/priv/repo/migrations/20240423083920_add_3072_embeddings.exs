defmodule Buildel.Repo.Migrations.Add3072Embeddings do
  use Ecto.Migration

  def change do
    alter table(:vector_collection_chunks) do
      add :embedding_3072, :vector, size: 3072
    end
  end
end
