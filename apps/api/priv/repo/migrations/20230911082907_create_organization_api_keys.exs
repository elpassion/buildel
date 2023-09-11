defmodule Buildel.Repo.Migrations.CreateOrganizationApiKeys do
  use Ecto.Migration

  def change do
    create table(:api_keys) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
      add :key, :string, null: false, unique: true

      timestamps()
    end

    create index(:api_keys, [:organization_id])
  end
end
