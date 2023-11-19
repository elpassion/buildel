defmodule Buildel.Repo.Migrations.AddSummaryToMemories do
  use Ecto.Migration

  def change do
    alter table(:memories) do
      add :summary, :string
      add :summary_embedding, :vector, size: 1536
    end
  end
end
