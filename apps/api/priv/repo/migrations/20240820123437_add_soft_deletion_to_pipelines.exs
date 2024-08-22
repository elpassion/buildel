defmodule Buildel.Repo.Migrations.AddSoftDeletionToPipelines do
  use Ecto.Migration

  def change do
    alter table(:pipelines) do
      add :deleted_at, :utc_datetime
    end

    alter table(:runs) do
      add :deleted_at, :utc_datetime
    end

    alter table(:run_costs) do
      add :deleted_at, :utc_datetime
    end

    execute """
            CREATE OR REPLACE RULE soft_deletion AS ON DELETE TO pipelines
            DO INSTEAD UPDATE pipelines SET deleted_at = NOW() WHERE id = OLD.id AND deleted_at IS NULL;
            """,
            """
            DROP RULE IF EXISTS soft_deletion ON pipelines;
            """

    execute """
              CREATE OR REPLACE RULE "soft_delete_runs" AS ON UPDATE TO pipelines
            WHERE NOT old.deleted_at IS NULL AND new.deleted_at IS NULL
            DO ALSO UPDATE runs SET deleted_at = NOW() WHERE pipeline_id = old.id;
            """,
            """
            DROP RULE IF EXISTS soft_delete_runs ON pipelines;
            """

    execute """
            CREATE OR REPLACE RULE soft_deletion AS ON DELETE TO runs
            DO INSTEAD UPDATE runs SET deleted_at = NOW() WHERE id = OLD.id AND deleted_at IS NULL;
            """,
            """
            DROP RULE IF EXISTS soft_deletion ON runs;
            """

    execute """
              CREATE OR REPLACE RULE "soft_delete_run_costs" AS ON UPDATE TO runs
            WHERE NOT old.deleted_at IS NULL AND new.deleted_at IS NULL
            DO ALSO UPDATE run_costs SET deleted_at = NOW() WHERE run_id = old.id;
            """,
            """
            DROP RULE IF EXISTS soft_delete_run_costs ON runs;
            """

    execute "CREATE OR REPLACE VIEW visible_pipelines AS SELECT * FROM pipelines WHERE deleted_at IS NULL",
            "DROP VIEW IF EXISTS visible_pipelines"
  end
end
