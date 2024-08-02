defmodule Buildel.Repo.Migrations.CreateExperimentRunRowRuns do
  use Ecto.Migration

  def change do
    create table(:experiment_run_row_runs) do
      add :experiment_run_id, references(:experiment_runs, on_delete: :delete_all), null: false
      add :dataset_row_id, references(:dataset_rows, on_delete: :delete_all), null: false
      add :run_id, references(:runs), null: false

      add :data, :map, default: %{}

      timestamps()
    end
  end
end
