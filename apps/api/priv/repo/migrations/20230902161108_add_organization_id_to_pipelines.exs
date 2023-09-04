defmodule Buildel.Repo.Migrations.AddOrganizationIdToPipelines do
  use Ecto.Migration

  def change do
    execute(fn ->
      repo().delete_all("runs")
      repo().delete_all("pipelines")
    end)

    alter table(:pipelines) do
      add(:organization_id, references(:organizations, on_delete: :delete_all), null: false)
    end
  end
end
