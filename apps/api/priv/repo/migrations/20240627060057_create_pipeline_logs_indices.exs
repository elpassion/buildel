defmodule Buildel.Repo.Migrations.CreatePipelineLogsIndices do
  use Ecto.Migration

  def change do
    create index(:pipeline_logs, [:processed, :inserted_at])
  end
end
