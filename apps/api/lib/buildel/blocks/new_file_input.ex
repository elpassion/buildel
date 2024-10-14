defmodule Buildel.Blocks.NewFileInput do
  use Buildel.Blocks.NewBlock

  defblock(:file_input,
    description:
      "A streamlined module designed for the efficient handling and transmission of file data.",
    groups: ["file", "inputs / outputs"]
  )

  definput(:input, schema: %{"type" => "object"}, public: true, type: :file_temporary)

  defoutput(:output, schema: %{"type" => "object"}, type: :file)

  def handle_input(:input, %Message{metadata: %{method: :delete}} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end
end
