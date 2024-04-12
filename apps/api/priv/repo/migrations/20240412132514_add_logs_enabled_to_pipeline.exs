defmodule Buildel.Repo.Migrations.AddLogsEnabledToPipeline do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add :logs_enabled, :boolean, default: false, null: false
    end
  end
end
