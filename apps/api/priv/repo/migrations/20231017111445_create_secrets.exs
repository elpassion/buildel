defmodule Buildel.Repo.Migrations.CreateSecrets do
  use Ecto.Migration

  def change do
    create table(:secrets) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
      add :name, :string, null: false
      add :value, :binary, null: false
      add :value_hash, :binary, null: false

      timestamps()
    end
  end
end
