defmodule Buildel.Repo.Migrations.AddEmbeddingsToCollections do
  use Ecto.Migration

  def change do
    alter table(:memory_collections) do
      add(:embeddings_api_type, :string, default: "openai", null: false)
      add(:embeddings_model, :string, default: "text-embedding-ada-002", null: false)
      add(:embeddings_secret_name, :string, default: "openai", null: false)
    end
  end
end
