defmodule Buildel.Repo.Migrations.CreateRunCosts do
  use Ecto.Migration

  def change do
    create table(:run_costs) do
      add :run_id, references(:runs, on_delete: :nothing)
      add :cost_id, references(:costs, on_delete: :nothing)
      add :description, :string

      timestamps()
    end
  end
end
