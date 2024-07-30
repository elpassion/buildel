defmodule Buildel.Blocks.FileInput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "file_input",
      description:
        "A streamlined module designed for the efficient handling and transmission of file data.",
      groups: ["file", "inputs / outputs"],
      inputs: [Block.file_temporary_input("input", true)],
      outputs: [Block.file_output()],
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
  def handle_input("input", {_name, :text, file_id, %{method: :delete}}, state) do
    output(state, "output", {:text, file_id}, %{metadata: %{method: :delete}})
  end

  @impl true
  def handle_input("input", {_name, :binary, chunk, metadata}, state) do
    output(state, "output", {:binary, chunk}, %{metadata: metadata})
  end
end
