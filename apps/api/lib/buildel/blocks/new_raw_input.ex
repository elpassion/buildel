defmodule Buildel.Blocks.NewRawInput do
  use Buildel.Blocks.NewBlock

  defblock(:raw_input,
    description: "USED ONLY FOR TEST PURPOSES",
    groups: []
  )

  definput(:input, schema: %{}, public: true)

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  defoutput(:output, schema: %{})
end
