defmodule Buildel.Repo.Migrations.AddEmbeddingsEndpointToMemoryCollections do
  use Ecto.Migration

  def change do
    alter table(:memory_collections) do
      add(:embeddings_endpoint, :string,
        default: "https://api.openai.com/v1/embeddings",
        null: false
      )
    end
  end
end
