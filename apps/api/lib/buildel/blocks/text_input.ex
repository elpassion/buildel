defmodule Buildel.Blocks.TextInput do
  use Buildel.Blocks.Block
  alias Buildel.Blocks.Utils.Message

  @impl true
  def options() do
    %{
      type: "text_input",
      description:
        "This module is crafted for the seamless intake and transmission of textual data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input("input", true), Block.text_output("forward")],
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
      "required" => ["name", "inputs"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema()
      }
    }
  end

  @impl true
  def handle_input("forward", %Message{} = message, state) do
    output(state, "output", message)
  end

  @impl true
  def handle_input("input", %Message{} = message, state) do
    output(state, "output", message)
  end

  def handle_input("forward", {_topic, :text, text, _metadata}, state) do
    output(state, "output", {:text, text})
  end

  @impl true
  def handle_input("input", {_topic, :text, text, _metadata}, state) do
    output(state, "output", {:text, text})
  end
end
