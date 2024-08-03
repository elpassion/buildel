defmodule Buildel.Repo.Migrations.AddRowsCountToDatasets do
  use Ecto.Migration

  def change do
    alter table(:datasets) do
      add :rows_count, :integer, default: 0
    end
  end
end
