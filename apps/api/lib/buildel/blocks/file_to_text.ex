defmodule Buildel.Blocks.FileToText do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "file_to_text",
      description: "Used for reading a content of a file and outputting it as text.",
      groups: ["file", "inputs / outputs"],
      inputs: [Block.file_input()],
      outputs: [Block.text_output()],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => %{}
          })
      }
    }
  end

  @impl true
  def handle_input("input", {_name, :binary, path, metadata}, state) do
    with {:ok, content} <- Buildel.DocumentWorkflow.get_content(path, metadata) do
      output(state, "output", {:text, content})
    else
      {:error, "Error reading file"} ->
        send_error(state, "Error reading file")
        state

      _ ->
        send_error(state, "Unknown error")
        state
    end
  end
end
