defmodule Buildel.Blocks.BlockValidator do
  def validate(block, block_config) do
    schema = block.options().schema |> ExJsonSchema.Schema.resolve()
    ExJsonSchema.Validator.validate(schema, block_config, error_formatter: false)
  end
end
