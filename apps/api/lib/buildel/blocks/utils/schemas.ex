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

  def secret_schema(%{} = attrs \\ %{}) do
    Map.merge(
      %{
        "type" => "string",
        "title" => "Secret",
        "description" => "Select from your secrets",
        "url" => "/api/organizations/{{organization_id}}/secrets?include_aliases=true",
        "presentAs" => "async-creatable-select",
        "minLength" => 1,
        "schema" => %{
          "type" => "object",
          "required" => ["name", "value"],
          "properties" => %{
            "name" => %{
              "type" => "string",
              "title" => "Name",
              "description" => "The name for the secret.",
              "minLength" => 1
            },
            "value" => %{
              "type" => "string",
              "title" => "Value",
              "description" => "The value of the secret.",
              "presentAs" => "password",
              "minLength" => 1
            }
          }
        }
      },
      attrs
    )
  end

  def push_property(schema, name, property_schema, required) do
    required_keys =
      case required do
        true -> schema.required ++ [name]
        false -> schema.required
      end

    properties = Jason.OrderedObject.new(schema.properties.values ++ [{name, property_schema}])

    %{schema | required: required_keys, properties: properties}
  end
end
