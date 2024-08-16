defmodule Buildel.Repo.Migrations.RemoveEmbeddings2FromChunks do
  use Ecto.Migration

  def change do
    alter table(:vector_collection_chunks) do
      remove :embedding_reduced_2, :vector, size: 2
    end
  end
end
