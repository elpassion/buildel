defmodule Buildel.Repo.Migrations.AddAliasToSecret do
  use Ecto.Migration

  def change do
    alter table(:secrets) do
      add :alias, :string
    end
  end
end
