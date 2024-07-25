defmodule Buildel.Blocks.Comment do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "comment",
      description:
        "This module is crafted for the seamless intake and transmission of textual data.",
      groups: ["utils"],
      inputs: [],
      outputs: [],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema(%{
          "required" => [],
          "properties" => Jason.OrderedObject.new(
            api_type: %{
              "type" => "string",
              "title" => "Model API type",
              "description" => "The API type to use for the chat.",
              "presentAs" => "wysiwyg",
            }
          )
        })
      }
    }
  end
end
