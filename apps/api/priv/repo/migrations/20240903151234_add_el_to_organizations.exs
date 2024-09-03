defmodule Buildel.Repo.Migrations.AddElToOrganizations do
  use Ecto.Migration

  def change do
    alter table(:organizations) do
      add :el_id, references(:pipelines), null: true
    end
  end
end
