defmodule Buildel.Repo.Migrations.CreateVectorCollectionChunks do
  use Ecto.Migration

  def change do
    execute "CREATE EXTENSION IF NOT EXISTS pgcrypto"

    create table(:vector_collection_chunks, primary_key: false) do
      add :id, :uuid, primary_key: true, default: fragment("gen_random_uuid()"), null: false
      add :collection_name, :string, null: false

      add :embedding_1536, :vector, size: 1536
      add :embedding_384, :vector, size: 384
      add :document, :text, null: false

      add :metadata, :map, null: false

      timestamps()
    end
  end
end
