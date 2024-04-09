defmodule Buildel.Repo.Migrations.AddMembershipInvitations do
  use Ecto.Migration

  def change do
    create table(:invitations) do
      add :organization_id, references(:organizations, on_delete: :delete_all), null: false
      add :user_id, references(:users, on_delete: :delete_all)
      add :email, :string, null: false
      add :token, :binary, null: false
      add :expires_at, :utc_datetime, null: false

      timestamps()
    end

    create index(:invitations, [:organization_id])
    create index(:invitations, [:user_id])
    create unique_index(:invitations, [:organization_id, :email])
  end
end
