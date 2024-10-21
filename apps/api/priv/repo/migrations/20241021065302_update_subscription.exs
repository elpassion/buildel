defmodule Buildel.Repo.Migrations.UpdateSubscription do
  use Ecto.Migration

  def change do
    alter table(:subscriptions) do
      modify :subscription_id, :string, null: true
      modify :customer_id, :string, null: true
    end
  end
end
