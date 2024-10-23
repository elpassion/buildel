defmodule Buildel.PipelineConfigMigrator do
  alias Buildel.BlockConfigMigrator

  def rename_block_types(
        %{"blocks" => blocks} = config,
        block_type,
        new_block_type
      ) do
    %{
      config
      | "blocks" => BlockConfigMigrator.rename_block_type(blocks, block_type, new_block_type)
    }
  end

  def add_block_opt(%{"blocks" => blocks} = config, block_type, opt, value) do
    %{
      config
      | "blocks" => BlockConfigMigrator.add_block_opt(blocks, block_type, opt, value)
    }
  end

  def remove_block_opt(%{"blocks" => blocks} = config, block_type, opt) do
    %{
      config
      | "blocks" => BlockConfigMigrator.remove_block_opt(blocks, block_type, opt)
    }
  end

  def update_block_config(%{"blocks" => blocks} = config, block_type, new_config) do
    %{
      config
      | "blocks" => BlockConfigMigrator.update_block_config(blocks, block_type, new_config)
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

  def connect_blocks(%{"connections" => connections} = config, %Buildel.Blocks.Connection{
        from: %Buildel.Blocks.Output{block_name: from_block, name: output_name},
        to: %Buildel.Blocks.Input{block_name: to_block, name: input_name},
        opts: %{reset: reset}
      }) do
    %{
      config
      | "connections" =>
          connections ++
            [
              %{
                "from" => %{"block_name" => from_block, "output_name" => output_name},
                "to" => %{"block_name" => to_block, "input_name" => input_name},
                "reset" => reset
              }
            ]
    }
  end

  def move_opts_to_section(config, block_type, section_name, opts) do
    config
    |> update_block_config(block_type, fn config ->
      section_opts = opts |> Enum.map(&{&1, config["opts"][&1]}) |> Enum.into(%{})

      config = BlockConfigMigrator.add_block_opt(config, section_name, section_opts)

      opts |> Enum.reduce(config, &BlockConfigMigrator.remove_block_opt(&2, &1))
    end)
  end

  def move_opts_from_section(config, block_type, section_name, opts) do
    config
    |> update_block_config(block_type, fn config ->
      section_opts = opts |> Enum.map(&{&1, config["opts"][section_name][&1]})

      config = BlockConfigMigrator.remove_block_opt(config, section_name)

      section_opts
      |> Enum.reduce(config, &BlockConfigMigrator.add_block_opt(&2, elem(&1, 0), elem(&1, 1)))
    end)
  end
end
