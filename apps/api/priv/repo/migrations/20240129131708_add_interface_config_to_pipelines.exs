defmodule Buildel.Repo.Migrations.AddInterfaceConfigToPipelines do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add :interface_config, :map
    end
  end
end
