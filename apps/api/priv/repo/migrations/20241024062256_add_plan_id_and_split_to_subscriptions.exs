defmodule Buildel.Repo.Migrations.AddPlanIdAndSplitToSubscriptions do
  use Ecto.Migration

  def change do
    alter table(:subscriptions) do
      add :plan_id, :string, null: true
      add :split, :integer, default: 1
    end
  end
end
