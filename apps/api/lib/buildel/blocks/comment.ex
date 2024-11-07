defmodule Buildel.Blocks.Comment do
  use Buildel.Blocks.NewBlock

  defblock(:comment,
    description: "",
    groups: ["utils"]
  )

  defoption(:content, %{ "type" => "string", "title" => "", "description" => "" })
  defoption(:color, %{ "type" => "string", "title" => "", "description" => ""  })
end
