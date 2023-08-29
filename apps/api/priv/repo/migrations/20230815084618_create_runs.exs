defmodule Buildel.Repo.Migrations.CreateRuns do
  use Ecto.Migration

  def change do
    create table(:runs) do
      add :pipeline_id, references(:pipelines, on_delete: :nothing)
      add :status, :integer

      timestamps()
    end

    create index(:runs, [:pipeline_id])
  end
end
