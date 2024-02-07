defmodule Buildel.PipelineConfigMigrator do
  def rename_block_types(
        %{"blocks" => blocks} = config,
        block_type,
        new_block_type
      ) do
    %{
      config
      | "blocks" =>
          Buildel.BlockConfigMigrator.rename_block_type(blocks, block_type, new_block_type)
    }
  end

  def add_block_opt(%{"blocks" => blocks} = config, block_type, opt, value) do
    %{
      config
      | "blocks" => Buildel.BlockConfigMigrator.add_block_opt(blocks, block_type, opt, value)
    }
  end

  def remove_block_opt(%{"blocks" => blocks} = config, block_type, opt) do
    %{
      config
      | "blocks" => Buildel.BlockConfigMigrator.remove_block_opt(blocks, block_type, opt)
    }
  end

  def update_block_config(%{"blocks" => blocks} = config, block_name, new_config) do
    %{
      config
      | "blocks" =>
          Buildel.BlockConfigMigrator.update_block_config(blocks, block_name, new_config)
    }
  end

  def add_block(%{"blocks" => blocks} = config, %{
        type: type,
        name: name,
        opts: opts,
        position: position
      }) do
    %{
      config
      | "blocks" =>
          blocks ++
            [
              %{
                "type" => type,
                "name" => name,
                "opts" => opts,
                "position" => position
              }
            ]
    }
  end

  def remove_blocks_with_type(
        %{"blocks" => blocks, "connections" => connections} = config,
        block_type
      ) do
    {rejected_blocks, new_blocks} = blocks |> Enum.split_with(&(&1["type"] == block_type))

    rejected_blocks_names = rejected_blocks |> Enum.map(& &1["name"])

    new_connections =
      connections
      |> Enum.reject(fn
        %{"from" => %{"block_name" => block_name}, "to" => %{"block_name" => to_block_name}} ->
          block_name in rejected_blocks_names || to_block_name in rejected_blocks_names
      end)

    %{
      config
      | "blocks" => new_blocks,
        "connections" => new_connections
    }
  end
end
