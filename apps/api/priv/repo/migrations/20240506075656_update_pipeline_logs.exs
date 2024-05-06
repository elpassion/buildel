defmodule Buildel.Repo.Migrations.UpdatePipelineLogs do
  use Ecto.Migration

  def change do
    alter table(:pipeline_logs) do
      modify :inserted_at, :naive_datetime_usec
      modify :updated_at, :naive_datetime_usec
    end
  end
end
