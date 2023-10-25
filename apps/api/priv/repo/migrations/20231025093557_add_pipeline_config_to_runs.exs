defmodule Buildel.Repo.Migrations.AddPipelineConfigToRuns do
  use Ecto.Migration

  def change do
    execute(fn ->
      repo().delete_all("runs")
    end)

    alter table(:runs) do
      add :config, :map, null: false
    end
  end
end
