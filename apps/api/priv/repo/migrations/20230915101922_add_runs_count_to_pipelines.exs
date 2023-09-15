defmodule Buildel.Repo.Migrations.AddRunsCountToPipelines do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add :runs_count, :integer, default: 0
    end
  end
end
