defmodule Buildel.Blocks.TextInput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_input",
      description:
        "This module is crafted for the seamless intake and transmission of textual data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input("input", true), Block.text_input("forward")],
      outputs: [Block.text_output("output", false), Block.text_output("forward", true, false)],
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
  def handle_input("forward", {_topic, :text, text, _metadata}, state) do
    state = state |> output("output", {:text, text})

    state |> output("forward", {:text, text})
  end

  @impl true
  def handle_input("input", {_topic, :text, text, _metadata}, state) do
    state = state |> output("output", {:text, text})

    state |> output("forward", {:text, text})
  end
end
