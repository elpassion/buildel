defmodule Buildel.BlockConfigMigrator do
  def rename_block_type(block_config, from_block_type, to_block_type)
      when is_list(block_config) do
    block_config
    |> map_blocks_with_type(
      from_block_type,
      &rename_block_type(&1, to_block_type)
    )
  end

  def rename_block_type(block_config, to_block_type) when is_map(block_config) do
    %{block_config | "type" => to_block_type}
  end

  def add_block_opt(block_config, block_type, opt, value) when is_list(block_config) do
    block_config |> map_blocks_with_type(block_type, &add_block_opt(&1, opt, value))
  end

  def add_block_opt(block_config, opt, value) when is_map(block_config) do
    %{block_config | "opts" => Map.put(block_config["opts"], opt, value)}
  end

  def remove_block_opt(block_config, block_type, opt) when is_list(block_config) do
    block_config |> map_blocks_with_type(block_type, &remove_block_opt(&1, opt))
  end

  def remove_block_opt(block_config, opt) when is_map(block_config) do
    %{block_config | "opts" => Map.delete(block_config["opts"], opt)}
  end

  defp map_blocks_with_type(blocks, block_type, fun) do
    blocks
    |> Enum.map(fn
      %{"type" => ^block_type} = block -> fun.(block)
      block -> block
    end)
  end
end
