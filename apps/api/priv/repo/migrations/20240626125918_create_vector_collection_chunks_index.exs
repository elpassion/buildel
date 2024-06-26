defmodule Buildel.Repo.Migrations.CreateVectorCollectionChunksIndex do
  use Ecto.Migration

  def change do
    execute "ALTER EXTENSION vector UPDATE;"
    execute "CREATE INDEX ON vector_collection_chunks USING hnsw ((embedding_3072::halfvec(3072)) halfvec_l2_ops);"
  end
end
