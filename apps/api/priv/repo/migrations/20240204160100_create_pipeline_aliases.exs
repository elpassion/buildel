defmodule Buildel.Repo.Migrations.CreatePipelineAliases do
  use Ecto.Migration

  def change do
    create table(:pipeline_aliases) do
      add :pipeline_id, references(:pipelines, on_delete: :delete_all)
      add :alias, :string, null: false

      add :name, :string, null: false
      add :config, :map, null: false
      add :interface_config, :map, null: false

      timestamps()
    end
  end
end
