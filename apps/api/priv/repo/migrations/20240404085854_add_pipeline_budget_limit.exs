defmodule Buildel.Repo.Migrations.AddPipelineBudgetLimit do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add(:budget_limit, :decimal, precision: 20, scale: 10, null: true)
    end
  end
end
