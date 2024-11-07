defmodule Buildel.Blocks.ImageInput do
  use Buildel.Blocks.NewBlock

  defblock(:image_input,
    description:
      "A streamlined module designed for the efficient handling and transmission of images.",
    groups: ["image", "inputs / outputs"]
  )

  definput(:input, schema: %{}, public: true, type: :image)
  defoutput(:output, schema: %{}, type: :image)

  def handle_input(:input, %Message{metadata: %{method: :delete}} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end

  def handle_input(:input, %Message{} = message, state) do
    output(state, :output, message)
    {:ok, state}
  end
end
