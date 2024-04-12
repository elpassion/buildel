defmodule Buildel.Repo.Migrations.FixLogsTypes do
  use Ecto.Migration

  def change do
    alter table(:pipeline_logs) do
      remove :message_type
      add :message_type, :integer
      modify :message, :text, from: :string
    end
  end
end
