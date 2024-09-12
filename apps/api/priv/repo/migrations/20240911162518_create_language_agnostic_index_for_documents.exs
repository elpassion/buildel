defmodule Buildel.Repo.Migrations.CreateLanguageAgnosticIndexForDocuments do
  use Ecto.Migration

  def up do
    alter table(:vector_collection_chunks) do
      add :language, :string, null: false, default: "polish"
    end

    execute """
      CREATE FUNCTION lang_to_regconfig(text) RETURNS regconfig
        LANGUAGE sql IMMUTABLE STRICT AS $$
        SELECT $1::regconfig; $$
    """

    execute """
      CREATE INDEX vector_collection_chunks_document_idx ON vector_collection_chunks
        USING gin(
          to_tsvector(
              lang_to_regconfig(language),
              coalesce(document, '')
          )
        );
    """
  end

  def down do
    alter table(:vector_collection_chunks) do
      remove :language
    end

    execute """
      DROP FUNCTION IF EXISTS lang_to_regconfig
    """

    execute """
      DROP INDEX IF EXISTS vector_collection_chunks_document_idx
    """
  end
end
