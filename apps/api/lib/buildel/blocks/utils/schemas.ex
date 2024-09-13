defmodule Buildel.Blocks.Utils.Schemas do
  def name_schema() do
    %{
      type: "string",
      title: "Name",
      description:
        "The name of the block. Can only contain letters, numbers, and underscores. Cannot include spaces.",
      minLength: 2,
      maxLength: 50,
      pattern: "^[^<>: ?-]*$",
      regex: %{
        pattern: "^[^<>: ?-]*$",
        errorMessage: "Invalid string. Characters '< > : - ? ' are not allowed."
      }
    }
  end

  def options_schema(
        %{required: _, properties: _} = schema \\ %{
          required: [],
          properties: %{}
        }
      ) do
    Map.merge(
      %{
        type: "object",
        title: "Options",
        description: "Additional options for the block.",
        required: [],
        properties: %{}
      },
      schema
    )
  end
end
