defmodule Buildel.Repo.Migrations.AddTotalCostToExperimentRun do
  use Ecto.Migration

  def change do
    alter table(:experiment_runs) do
      add :total_cost, :decimal, precision: 20, scale: 10, default: 0, null: false
    end
  end
end
