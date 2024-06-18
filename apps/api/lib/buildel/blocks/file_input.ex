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

  def handle_input("input", {:text, file_id, %{method: :delete}}) do
    [
      {:start_stream, "output"},
      {:output, "output", {:text, file_id, %{metadata: %{method: :delete}}}},
      {:stop_stream, "output"}
    ]
  end

  def handle_input("input", {:binary, chunk, metadata}) do
    [
      {:start_stream, "output"},
      {:output, "output", {:binary, chunk, metadata}},
      {:stop_stream, "output"}
    ]
  end
end
