defmodule Grifel.Repo.Migrations.CreateMemberships do
  use Ecto.Migration

  def change do
    create table(:memberships) do
      add :organization_id, references(:organizations, on_delete: :delete_all)
      add :user_id, references(:users, on_delete: :delete_all)

      timestamps()
    end

    create index(:memberships, [:organization_id])
    create index(:memberships, [:user_id])
    create unique_index(:memberships, [:organization_id, :user_id])
  end
end
