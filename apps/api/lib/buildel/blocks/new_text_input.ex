defmodule Buildel.Blocks.NewTextInput do
  use Buildel.Blocks.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, %{"type" => "string"}, public: true)

  def handle_input(:input, %Message{} = message) do
    output(:output, message)
  end

  definput(:forward, %{"type" => "string"})

  def handle_input(:forward, %Message{} = message) do
    output(:output, message)
  end

  defoutput(:output, %{"type" => "string"})
end
