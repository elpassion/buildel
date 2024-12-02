defmodule Buildel.Blocks.Video do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "video",
      description: "Block for adding YouTube videos to the workflow",
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
            "required" => ["url"],
            "properties" =>
              Jason.OrderedObject.new(
                url: %{
                  "type" => "string",
                  "title" => "URL",
                  "description" => "YouTube video URL",
                  "regex" => %{
                    "pattern" => "^(https:\\/\\/(?:www\\.)?youtube\\.com\\/watch\\?v=|https:\\/\\/youtu\\.be\\/)([A-Za-z0-9_-]{11})$",
                    "errorMessage" => "Invalid YouTube URL format."
                  }
                }
              )
          })
      }
    }
  end
end
