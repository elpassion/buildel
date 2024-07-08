defmodule Buildel.Repo.Migrations.AddInterfaceConfigToRun do
  use Ecto.Migration

  def change do
    alter table(:runs) do
      add :interface_config, :map, default: %{}
    end
  end
end
