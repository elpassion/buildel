defmodule Buildel.Repo.Migrations.CreateExperimentRuns do
  use Ecto.Migration

  def change do
    create table(:experiment_runs) do
      add :experiment_id, references(:experiments, on_delete: :delete_all), null: false
      add :status, :integer

      timestamps()
    end

    alter table(:experiments) do
      add :runs_count, :integer, default: 0
    end
  end
end
