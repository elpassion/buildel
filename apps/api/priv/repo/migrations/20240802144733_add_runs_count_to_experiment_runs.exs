defmodule Buildel.Repo.Migrations.AddRunsCountToExperimentRuns do
  use Ecto.Migration

  def change do
    alter table(:experiment_runs) do
      add :runs_count, :integer, default: 0
    end
  end
end
