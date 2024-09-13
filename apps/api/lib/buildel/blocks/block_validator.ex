defmodule Buildel.Blocks.BlockValidator do
  def validate(block, block_config) do
    schema =
      block.options().schema
      |> Jason.encode!()
      |> Jason.decode!()
      |> ExJsonSchema.Schema.resolve()

    ExJsonSchema.Validator.validate(schema, block_config, error_formatter: false)
  end
end
