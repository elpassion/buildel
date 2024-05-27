defmodule Buildel.Repo.Migrations.AddMemoryUuidToMemory do
  use Ecto.Migration

  def change do
    alter table(:memories) do
      add(:file_uuid, :uuid, default: fragment("gen_random_uuid()"), null: false)
    end
  end
end
