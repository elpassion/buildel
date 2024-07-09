defmodule Buildel.Blocks.FileOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "file_output",
      description:
        "A streamlined module designed for the efficient handling and transmission of file data.",
      groups: ["file", "inputs / outputs"],
      inputs: [Block.file_input()],
      outputs: [Block.file_output("output", true)],
      ios: [],
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
