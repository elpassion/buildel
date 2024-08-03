defmodule Buildel.Repo.Migrations.AddInputsAndOutputsToExperimentRuns do
  use Ecto.Migration

  def change do
    alter table(:experiment_runs) do
      add :inputs, {:array, :string}, null: false, default: []
      add :outputs, {:array, :string}, null: false, default: []
    end
  end
end
