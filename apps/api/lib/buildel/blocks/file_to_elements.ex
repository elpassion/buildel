defmodule Buildel.Blocks.FileToElements do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "file_to_elements",
      description:
        "Used for reading a content of a file and outputting it as a list of elements.",
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
    state = send_stream_start(state, "output")

    with {:ok, items} <- Buildel.DocumentWorkflow.read(path, metadata) do
      output(state, "output", {:text, Jason.encode!(items)})
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
