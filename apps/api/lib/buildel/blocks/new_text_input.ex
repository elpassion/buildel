defmodule Buildel.Blocks.NewTextInput do
  use Buildel.Blocks.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, schema: %{"type" => "string"}, public: true)
  definput(:forward, schema: %{"type" => "string"})

  defoutput(:output, schema: %{"type" => "string"})

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  def handle_input(:forward, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end
end
