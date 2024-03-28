defmodule Buildel.Repo.Migrations.AddTokensToCosts do
  use Ecto.Migration

  def change do
    alter table(:costs) do
      add(:input_tokens, :integer, default: 0, null: false)
      add(:output_tokens, :integer, default: 0, null: false)
    end
  end
end
