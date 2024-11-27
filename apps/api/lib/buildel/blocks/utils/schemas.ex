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

  def memory_schema(
        %{
          "default" => _default,
          "title" => title,
          "description" => description,
          "readonly" => readonly
        } \\ %{
          "default" => "{{pipeline_id}}_{{block_name}}",
          "title" => "Persist in",
          "description" => "Memory collection to use.",
          "readonly" => false
        }
      ) do
    %{
      "type" => "string",
      "title" => title,
      "description" => description,
      "readonly" => readonly,
      "url" => "/api/organizations/{{organization_id}}/memory_collections",
      "presentAs" => "async-creatable-select",
      "schema" => %{
        "type" => "object",
        "required" => ["collection_name"],
        "properties" => %{
          "collection_name" => %{
            "type" => "string",
            "title" => "Name",
            "description" => "The name for collection.",
            "minLength" => 1
          },
          "embeddings" => %{
            "type" => "object",
            "title" => "Embeddings",
            "description" => "The embeddings to use for the collection.",
            "required" => ["api_type", "model", "secret_name"],
            "properties" => %{
              "api_type" => %{
                "type" => "string",
                "title" => "API Type",
                "description" => "The type of the embeddings API.",
                "enum" => ["openai"],
                "default" => "openai",
                "enumPresentAs" => "radio"
              },
              "model" => %{
                "type" => "string",
                "title" => "Model",
                "description" => "The model to use for the embeddings.",
                "url" =>
                  "/api/organizations/{{organization_id}}/models/embeddings?api_type={{embeddings.api_type}}",
                "presentAs" => "async-select"
              },
              "secret_name" =>
                secret_schema(%{
                  "title" => "Embeddings Secret",
                  "description" => "The secret to use for the embeddings."
                })
            }
          }
        }
      }
    }
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
