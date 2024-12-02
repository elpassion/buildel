defmodule Buildel.Blocks.Comment do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "comment",
      description: "Block for adding comments to the workflow",
      groups: ["utils"],
      inputs: [],
      outputs: [],
      ios: [],
      dynamic_ios: nil,
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
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" =>
              Jason.OrderedObject.new(
                content: %{
                  "type" => "string",
                  "title" => "",
                  "description" => ""
                },
                color: %{
                  "type" => "string",
                  "title" => "",
                  "description" => ""
                }
              )
          })
      }
    }
  end
end
