defmodule Buildel.Repo.Migrations.DisableStats do
  use Ecto.Migration

  def change do
    execute "DROP EXTENSION IF EXISTS pg_stat_statements"
  end
end
