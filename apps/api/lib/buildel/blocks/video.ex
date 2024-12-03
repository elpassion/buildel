defmodule Buildel.Blocks.Video do
  use Buildel.Blocks.NewBlock

  defblock(:video,
    description: "Block for adding YouTube videos to the workflow",
    groups: ["utils"]
  )

  defoption(:url, %{ "type" => "string",
    "title" => "URL",
    "description" => "YouTube video URL",
    "regex" => %{
      "pattern" => "^(https:\\/\\/(?:www\\.)?youtube\\.com\\/watch\\?v=|https:\\/\\/youtu\\.be\\/)([A-Za-z0-9_-]{11})$",
      "errorMessage" => "Invalid YouTube URL format."
    } })
end
