defmodule Buildel.Repo.Migrations.AddEvaluationAvgToExperimentRun do
  use Ecto.Migration

  def change do
    alter table(:experiment_runs) do
      add :evaluations_avg, :float
    end
  end
end
