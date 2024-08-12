defmodule Buildel.Repo.Migrations.AddEvaluationAvgToRunRowRun do
  use Ecto.Migration

  def change do
    alter table(:experiment_run_row_runs) do
      add :evaluation_avg, :float
    end
  end
end
