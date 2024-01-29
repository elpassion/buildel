defmodule Buildel.Repo.Migrations.AddInterfaceConfigToPipelines do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add :interfaceConfig, :map
    end
  end
end
