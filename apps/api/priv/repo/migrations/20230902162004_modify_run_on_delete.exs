defmodule Buildel.Repo.Migrations.ModifyRunOnDelete do
  use Ecto.Migration

  def up do
    drop(constraint(:runs, "runs_pipeline_id_fkey"))

    alter table(:runs) do
      modify(:pipeline_id, references(:pipelines, on_delete: :delete_all))
    end
  end

  def down do
    drop(constraint(:runs, "runs_pipeline_id_fkey"))

    alter table(:runs) do
      modify(:pipeline_id, references(:pipelines, on_delete: :nothing))
    end
  end
end
