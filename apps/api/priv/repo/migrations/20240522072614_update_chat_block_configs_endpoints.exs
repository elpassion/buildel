defmodule Buildel.Repo.Migrations.UpdateChatBlockConfigsEndpoints do
  alias Buildel.Pipelines.Alias
  alias Buildel.Pipelines.Pipeline
  use Ecto.Migration

  def up do
    Buildel.Repo.transaction(fn ->
      Buildel.Repo.all({"pipelines", Buildel.Pipelines.Pipeline})
      |> Enum.map(fn pipeline ->
        Pipeline.changeset(pipeline, %{config: update_endpoint(pipeline.config)})
        |> Buildel.Repo.update!()
      end)

      Buildel.Repo.all(Buildel.Pipelines.Alias)
      |> Enum.map(fn alias ->
        Alias.changeset(alias, %{config: update_endpoint(alias.config)})
        |> Buildel.Repo.update!()
      end)
    end)
  end

  def down do
    nil
  end

  defp update_endpoint(config) do
    Buildel.PipelineConfigMigrator.update_block_config(
      config,
      "chat",
      fn block_config ->
        update_in(
          block_config,
          ["opts", "endpoint"],
          &String.replace(&1 || "https://api.openai.com/v1", "/chat/completions", "")
        )
        |> update_in(
          ["opts", "endpoint"],
          &String.replace(
            &1 || "https://api.openai.com/v1",
            ~r/\?api_version=\w\w\w\w-\w\w-\w\w/,
            ""
          )
        )
      end
    )
  end
end
