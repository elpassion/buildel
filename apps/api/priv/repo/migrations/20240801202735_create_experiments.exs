defmodule Buildel.Repo.Migrations.CreateExperiments do
  use Ecto.Migration

  def change do
    create table(:experiments) do
      add :name, :string
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false
      add :pipeline_id, references(:pipelines, on_delete: :delete_all), null: false
      add :dataset_id, references(:datasets, on_delete: :delete_all), null: false

      timestamps()
    end
  end
end
