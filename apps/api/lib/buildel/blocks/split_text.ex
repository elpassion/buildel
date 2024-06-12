defmodule Buildel.Blocks.SplitText do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "split_text",
      description:
        "It's an essential utility for processing large texts, enabling efficient text handling and manipulation in Buildel applications.",
      groups: ["utils", "text"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("output")],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["condition"],
            "properties" => %{
              chunk_size: %{
                "type" => "number",
                "title" => "Chunk size",
                "description" => "The value to compare the input to.",
                "minimum" => 0,
                "default" => 500
              }
            }
          })
      }
    }
  end

  defp split(text, state) do
    state = state |> send_stream_start("output")

    text
    |> String.codepoints()
    |> Enum.chunk_every(state.opts[:chunk_size])
    |> Enum.take(1)
    |> Enum.map(fn chunk ->
      BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text,
         chunk
         |> Enum.join("")}
      )
    end)

    state |> send_stream_stop("output")
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    split(text, state)
  end
end
