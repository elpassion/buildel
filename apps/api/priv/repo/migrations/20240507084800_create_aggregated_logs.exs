defmodule Buildel.Repo.Migrations.CreateAggregatedLogs do
  use Ecto.Migration

  def change do
    create table(:pipeline_aggregated_logs) do
      add :run_id, references(:runs, on_delete: :delete_all), null: false
      add :message_types, {:array, :string}
      add :raw_logs, {:array, :integer}
      add :message, :text
      add :block_name, :string
      add :context, :string

      timestamps(type: :naive_datetime_usec)
    end
  end
end
