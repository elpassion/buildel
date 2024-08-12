defmodule Buildel.Repo.Migrations.AddColumnsAvgToExperimentRun do
  use Ecto.Migration

  def change do
    alter table(:experiment_runs) do
      add :columns_avg, :map, default: %{}
    end
  end
end
