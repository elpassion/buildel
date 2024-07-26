defmodule Buildel.Blocks.Comment do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "comment",
      description: "",
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
            content: %{
              "type" => "string",
              "title" => "",
              "description" => "",
            },
            color: %{
              "type" => "string",
              "title" => "",
              "description" => "",
            }
          )
        })
      }
    }
  end
end
