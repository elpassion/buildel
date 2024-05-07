defmodule Buildel.Repo.Migrations.AddProcessedToPipelineLogs do
  use Ecto.Migration

  def change do
    alter table(:pipeline_logs) do
      add(:processed, :boolean, default: false)
    end
  end
end
