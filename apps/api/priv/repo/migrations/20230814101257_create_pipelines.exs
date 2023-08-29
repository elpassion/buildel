defmodule Buildel.Repo.Migrations.CreatePipelines do
  use Ecto.Migration

  def change do
    create table(:pipelines) do
      add :name, :string
      add :config, :map

      timestamps()
    end
  end
end
