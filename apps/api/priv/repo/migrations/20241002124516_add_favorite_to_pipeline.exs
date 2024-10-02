defmodule Buildel.Repo.Migrations.AddFavoriteToPipeline do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add(:favorite, :boolean, default: false)
    end

    execute "CREATE OR REPLACE VIEW visible_pipelines AS SELECT * FROM pipelines WHERE deleted_at IS NULL",
            "DROP VIEW IF EXISTS visible_pipelines"
  end
end
