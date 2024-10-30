defmodule Buildel.Migrations.AddSectionsToChatBlocks do
  alias Buildel.PipelineConfigMigrator

  def migrate(pipelines, aliases) do
    pipelines =
      pipelines
      |> Enum.map(fn pipeline ->
        move_chat_opts_to_model_section(pipeline)
      end)

    aliases =
      aliases
      |> Enum.map(fn pipeline_alias ->
        move_chat_opts_to_model_section(pipeline_alias)
      end)

    %{pipelines: pipelines, aliases: aliases}
  end

  def rollback(pipelines, aliases) do
    pipelines =
      pipelines
      |> Enum.map(fn pipeline ->
        move_chat_opts_from_model_section(pipeline)
      end)

    aliases =
      aliases
      |> Enum.map(fn pipeline_alias ->
        move_chat_opts_from_model_section(pipeline_alias)
      end)

    %{pipelines: pipelines, aliases: aliases}
  end

  defp move_chat_opts_to_model_section(%{config: config} = pipeline_or_alias) do
    %{
      pipeline_or_alias
      | config:
          config
          |> PipelineConfigMigrator.move_opts_to_section("chat", "model_section", [
            "api_type",
            "api_key",
            "model",
            "endpoint",
            "temperature"
          ])
    }
  end

  defp move_chat_opts_from_model_section(%{config: config} = pipeline_or_alias) do
    %{
      pipeline_or_alias
      | config:
          config
          |> PipelineConfigMigrator.move_opts_from_section("chat", "model_section", [
            "api_type",
            "api_key",
            "model",
            "endpoint",
            "temperature"
          ])
    }
  end
end
