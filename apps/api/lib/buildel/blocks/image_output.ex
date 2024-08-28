defmodule Buildel.Blocks.ImageOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "image_output",
      description:
        "A streamlined module designed for the efficient handling and transmission of images.",
      groups: ["image", "inputs / outputs"],
      inputs: [Block.image_input()],
      outputs: [Block.image_output("output", true)],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema()
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :binary, path, metadata}, state) do
    content = File.read!(path)
    output(state, "output", {:binary, content}, %{metadata: metadata})
  end
end
