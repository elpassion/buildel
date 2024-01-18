defmodule Buildel.Blocks.Connection do
  defstruct [:from, :to, :opts]

  def from_connection_string(connection_string, to_type, from_type \\ nil) do
    %{block_name: block_name, input_name: input_name, output_name: output_name, reset: reset} =
      connection_description_from_connection_string(connection_string)

    from_type = from_type || to_type

    %Buildel.Blocks.Connection{
      from: %Buildel.Blocks.Output{name: output_name, block_name: block_name, type: from_type},
      to: %Buildel.Blocks.Input{name: input_name, block_name: block_name, type: to_type},
      opts: %{reset: reset}
    }
  end

  def from_api_connection(connection, to_type, from_type \\ nil) do
    reset =
      if is_boolean(connection["opts"]["reset"]),
        do: connection["opts"]["reset"],
        else: true

    %Buildel.Blocks.Connection{
      from: %Buildel.Blocks.Output{
        name: connection["from"]["output_name"],
        block_name: connection["from"]["block_name"],
        type: from_type
      },
      to: %Buildel.Blocks.Input{
        name: connection["to"]["input_name"],
        block_name: connection["to"]["block_name"],
        type: to_type
      },
      opts: %{reset: reset}
    }
  end

  def connections_for_block(block_name, blocks_map) do
    block = blocks_map |> Map.fetch!(block_name)

    if block["connections"] do
      connections_for_block_from_api_connections(
        block["name"],
        blocks_map
      )
    else
      connections_for_block_from_connection_strings(block["name"], blocks_map)
    end ++ Buildel.Blocks.type(block["type"]).public_connections(block["name"])
  end

  def connections_for_block_from_connection_strings(to_block_name, blocks_map) do
    to_block = blocks_map |> Map.fetch!(to_block_name)

    to_block
    |> Map.get("inputs")
    |> Enum.map(fn connection_string ->
      %{
        block_name: from_block_name,
        input_name: input_name,
        output_name: output_name,
        reset: reset
      } =
        connection_description_from_connection_string(connection_string)

      from_block = blocks_map |> Map.get(from_block_name)

      to_options = Buildel.Blocks.type(to_block["type"]).options
      from_options = Buildel.Blocks.type(from_block["type"]).options

      to =
        (to_options[:inputs] ++ to_options[:ios])
        |> Enum.find(fn %{name: name} -> name == input_name end)

      from =
        (from_options[:outputs] ++ from_options[:ios])
        |> Enum.find(fn %{name: name} -> name == output_name end)

      %Buildel.Blocks.Connection{
        from: %Buildel.Blocks.Output{
          name: from.name,
          type: from.type,
          block_name: from_block_name
        },
        to: %Buildel.Blocks.Input{name: to.name, type: to.type, block_name: to_block_name},
        opts: %{reset: reset}
      }
    end)
  end

  def connections_for_block_from_api_connections(to_block_name, blocks_map) do
    block = blocks_map |> Map.fetch!(to_block_name)

    block["connections"]
    |> Enum.map(fn connection ->
      to_options = Buildel.Blocks.type(block["type"]).options

      to =
        (to_options[:inputs] ++ to_options[:ios])
        |> Enum.find(fn %{name: name} -> name == connection["to"]["input_name"] end)

      from_block = blocks_map |> Map.get(connection["from"]["block_name"])
      from_options = Buildel.Blocks.type(from_block["type"]).options

      from =
        (from_options[:outputs] ++ from_options[:ios])
        |> Enum.find(fn %{name: name} -> name == connection["from"]["output_name"] end)

      Buildel.Blocks.Connection.from_api_connection(connection, to.type, from.type)
    end)
  end

  defp connection_description_from_connection_string(connection_string) do
    [connection_string, reset] =
      case connection_string |> String.split("?") do
        [connection_string, "false"] -> [connection_string, false]
        [connection_string, "true"] -> [connection_string, true]
        [connection_string] -> [connection_string, true]
      end

    [block_name, io_name] = connection_string |> String.split(":")

    [output_name, input_name] =
      case String.split(io_name, "->") do
        [output_name, input_name] -> [output_name, input_name]
        [input_name] -> ["input", input_name]
      end

    %{
      block_name: block_name,
      output_name: output_name,
      input_name: input_name,
      reset: reset
    }
  end
end
