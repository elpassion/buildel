defmodule Buildel.Repo.Migrations.ConvertLogsMessageType do
  use Ecto.Migration

  def change do
    alter table(:pipeline_logs) do
      modify :message_type, :text, from: :string
    end
  end
end
