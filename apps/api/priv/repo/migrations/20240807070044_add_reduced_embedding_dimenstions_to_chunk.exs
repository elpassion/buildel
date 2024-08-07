defmodule Buildel.Repo.Migrations.AddReducedEmbeddingDimenstionsToChunk do
  use Ecto.Migration

  def change do
    alter table(:vector_collection_chunks) do
      add :embedding_reduced_2, :vector, size: 2
    end
  end
end
