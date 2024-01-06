defmodule Buildel.Blocks.Connection do
  defstruct [:block_name, :output, :input, :opts]

  def connections_for_block(block_name, blocks_map) do
    block = blocks_map |> Map.fetch!(block_name)

    block
    |> Map.get("inputs")
    |> Enum.map(fn connection_string ->
      %{block_name: block_name, input_name: input_name, output_name: output_name} =
        connection_description_from_connection_string(connection_string)

      output_block = blocks_map |> Map.get(block_name)

      input_options = Buildel.Blocks.type(block["type"]).options
      output_options = Buildel.Blocks.type(output_block["type"]).options

      input =
        (input_options[:inputs] ++ input_options[:ios])
        |> Enum.find(fn %{name: name} -> name == input_name end)

      output =
        (output_options[:outputs] ++ output_options[:ios])
        |> Enum.find(fn %{name: name} -> name == output_name end)

      %Buildel.Blocks.Connection{
        block_name: block_name,
        output: %Buildel.Blocks.Output{name: output.name, type: output.type},
        input: %Buildel.Blocks.Input{name: input.name, type: input.type},
        opts: %{reset: true}
      }
    end)
  end

  defp connection_description_from_connection_string(connection_string) do
    [block_name, io_name] = connection_string |> String.split(":")

    [output_name, input_name] =
      case String.split(io_name, "->") do
        [output_name, input_name] -> [output_name, input_name]
        [input_name] -> ["input", input_name]
      end

    %{
      block_name: block_name,
      output_name: output_name,
      input_name: input_name
    }
  end
end
