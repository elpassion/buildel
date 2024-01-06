defmodule Buildel.Blocks.Connection do
  defstruct [:block_name, :output, :input, :opts]

  def connections_for_block(block_name, blocks_map) do
    block = blocks_map |> Map.get(block_name)

    block
    |> Map.get("inputs")
    |> Enum.map(fn input ->
      %{block_name: block_name, input_name: input_name, output_name: output_name} =
        Buildel.BlockPubSub.block_from_block_output(input)

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
        output: %Buildel.Blocks.Output{
          name: output["name"],
          type: output["type"]
        },
        input: %Buildel.Blocks.Input{
          name: input["name"],
          type: input["type"]
        },
        opts: %{
          reset: true
        }
      }
    end)
  end
end
