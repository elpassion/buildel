defmodule Buildel.Repo.Migrations.CreateDatasets do
  use Ecto.Migration

  def change do
    create table(:datasets) do
      add :name, :string
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false

      timestamps()
    end

    create table(:dataset_rows) do
      add :index, :integer
      add :data, :map
      add :dataset_id, references(:datasets, on_delete: :delete_all), null: false

      timestamps()
    end
  end
end
