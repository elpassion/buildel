defmodule Buildel.Blocks.TextInput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_input",
      description:
        "This module is crafted for the seamless intake and transmission of textual data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input("input", true)],
      outputs: [Block.text_output()],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema()
      }
    }
  end

  def handle_input("input", {_topic, message_type, value, metadata}) do
    [
      {:start_stream, "output"},
      {:output, "output", {message_type, value, metadata}},
      {:stop_stream, "output"}
    ]
  end
end
