defmodule Buildel.Blocks.NewTextInput do
  use Buildel.Blocks.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, %{"type" => "string"}, public: true)

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  definput(:forward, %{"type" => "string"})

  def handle_input(:forward, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  defoutput(:output, %{"type" => "string"})
end
