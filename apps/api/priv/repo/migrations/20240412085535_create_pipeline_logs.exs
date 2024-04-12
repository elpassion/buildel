defmodule Buildel.Repo.Migrations.CreatePipelineLogs do
  use Ecto.Migration

  def change do
    create table(:pipeline_logs) do
      add :run_id, references(:runs, on_delete: :delete_all), null: false
      add :message_type, :integer
      add :message, :string
      add :latency, :integer
      add :block_name, :string
      add :output_name, :string

      timestamps()
    end
  end
end
