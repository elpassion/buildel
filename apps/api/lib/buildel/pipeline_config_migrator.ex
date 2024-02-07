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
end
