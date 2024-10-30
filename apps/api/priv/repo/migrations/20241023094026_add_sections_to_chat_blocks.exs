defmodule Buildel.Repo.Migrations.AddSectionsToChatBlocks do
  use Ecto.Migration

  def up do
    repo().transaction(fn ->
      pipelines = repo().all(Buildel.Pipelines.Pipeline)
      aliases = repo().all(Buildel.Pipelines.Alias)

      %{pipelines: new_pipelines, aliases: new_aliases} =
        Buildel.Migrations.AddSectionsToChatBlocks.migrate(pipelines, aliases)

      Enum.zip(new_pipelines, pipelines)
      |> Enum.map(fn {new_pipeline, pipeline} ->
        changeset = pipeline |> Ecto.Changeset.change(config: new_pipeline.config)
        repo().update(changeset)
      end)

      Enum.zip(new_aliases, aliases)
      |> Enum.map(fn {new_alias, pipeline_alias} ->
        changeset = pipeline_alias |> Ecto.Changeset.change(config: new_alias.config)
        repo().update(changeset)
      end)
    end)
  end

  def down do
    repo().transaction(fn ->
      pipelines = repo().all(Buildel.Pipelines.Pipeline)
      aliases = repo().all(Buildel.Pipelines.Alias)

      %{pipelines: new_pipelines, aliases: new_aliases} =
        Buildel.Migrations.AddSectionsToChatBlocks.rollback(pipelines, aliases)

      Enum.zip(new_pipelines, pipelines)
      |> Enum.map(fn {new_pipeline, pipeline} ->
        changeset = pipeline |> Ecto.Changeset.change(config: new_pipeline.config)
        repo().update(changeset)
      end)

      Enum.zip(new_aliases, aliases)
      |> Enum.map(fn {new_alias, pipeline_alias} ->
        changeset = pipeline_alias |> Ecto.Changeset.change(config: new_alias.config)
        repo().update(changeset)
      end)
    end)
  end
end
