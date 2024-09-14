defmodule Buildel.Blocks.NewTextOutput do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.NewBlock

  defblock(:text_output,
    description: "A versatile module designed to output text data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, %{"type" => "string"})
  defoutput(:output, %{"type" => "string"}, public: true)
  defoutput(:forward, %{"type" => "string"})

  defoption(:stream_timeout, %{
    type: "number",
    title: "Stop after (ms)",
    description:
      "Wait this many milliseconds after receiving the last chunk before stopping the stream.",
    minimum: 500,
    default: 500,
    step: 1
  })

  defoption(
    :jq_filter,
    EditorField.new(%{
      title: "JQ Filter",
      description: "JQ filter to apply to the response.",
      editorLanguage: "json",
      default: ".",
      minLength: 1
    })
  )

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    output(state, :forward, message)
    {:ok, state}
  end
end
