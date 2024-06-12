defmodule Buildel.Blocks.TextInput do
  use Buildel.Blocks.Block

  # Config

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

  # Server

  @impl true
  def handle_info({_name, :text, text, _metadata}, state) do
    state = output(state, "output", {:text, text})
    {:noreply, state}
  end
end
