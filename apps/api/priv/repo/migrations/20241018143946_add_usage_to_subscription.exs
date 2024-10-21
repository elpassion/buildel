defmodule Buildel.Repo.Migrations.AddUsageToSubscription do
  use Ecto.Migration

  def change do
    alter table(:subscriptions) do
      add :usage, :map, default: %{}
    end
  end
end
