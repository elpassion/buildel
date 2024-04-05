defmodule Buildel.Repo.Migrations.CreateCosts do
  use Ecto.Migration

  def change do
    create table(:costs) do
      add :organization_id, references(:organizations, on_delete: :nothing)

      add :amount, :decimal, precision: 20, scale: 10

      timestamps()
    end
  end
end
