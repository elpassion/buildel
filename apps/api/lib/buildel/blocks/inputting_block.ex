defmodule Buildel.Blocks.InputtingBlock do
  defstruct [:block_name, :output, :input, :opts]

  def inputting_blocks_for_block(block_name, blocks_map) do
    block = blocks_map |> Map.get(block_name)

    block
    |> Map.get("inputs")
    |> Enum.map(fn input ->
      %{block_name: block_name, input_name: input_name, output_name: output_name} =
        Buildel.BlockPubSub.block_from_block_output(input)

      output_block = blocks_map |> Map.get(block_name)

      input =
        (block["block_type"]["inputs"] ++ block["block_type"]["ios"])
        |> Enum.find(fn %{"name" => name} -> name == input_name end)

      output =
        (output_block["block_type"]["outputs"] ++ output_block["block_type"]["ios"])
        |> Enum.find(fn %{"name" => name} -> name == output_name end)

      %Buildel.Blocks.InputtingBlock{
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
