defmodule Buildel.Blocks.NewSplitText do
  use Buildel.Blocks.NewBlock

  defblock(:split_text,
    description:
      "It's an essential utility for processing large texts, enabling efficient text handling and manipulation in Buildel applications.",
    groups: ["utils", "text"]
  )

  definput(:input, schema: %{"type" => "string"})
  defoutput(:output, schema: %{"anyOf" => [%{"type" => "string"}, %{}]})

  defoption(
    :chunk_size,
    %{
      type: "number",
      title: "Chunk size",
      description: "The value to compare the input to.",
      minimum: 0,
      default: 500
    }
  )

  defp split(%Message{message: text} = message, state) do
    text
    |> String.codepoints()
    |> Enum.chunk_every(option(state, :chunk_size))
    |> Enum.map(fn chunk ->
      output(state, :output, message |> Message.from_message() |> Message.set_message(chunk |> Enum.join("")))
    end)

    {:ok, state}
  end

  def handle_input(:input, %Message{} = message, state) do
    split(message, state)
  end
end
