defmodule Buildel.Repo.Migrations.AddApiKeyToOrganizations do
  use Ecto.Migration

  def up do
    alter table(:organizations) do
      add :api_key, :binary, null: true
      add :api_key_hash, :binary, null: true
    end
  end

  def down do
    alter table(:organizations) do
      remove :api_key
      remove :api_key_hash
    end
  end
end
