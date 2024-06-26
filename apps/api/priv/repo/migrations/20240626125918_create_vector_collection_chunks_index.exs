defmodule Buildel.Repo.Migrations.CreateVectorCollectionChunksIndex do
  use Ecto.Migration

  def up do
    execute "ALTER EXTENSION vector UPDATE;"
    execute "CREATE INDEX ON vector_collection_chunks (collection_name);"

    execute "CREATE INDEX ON vector_collection_chunks USING hnsw ((embedding_3072::halfvec(3072)) halfvec_l2_ops);"
  end

  def down do
    execute "DROP INDEX IF EXISTS vector_collection_chunks_collection_name_idx;"
    execute "DROP INDEX IF EXISTS vector_collection_chunks_embedding_3072_idx;"
  end
end
