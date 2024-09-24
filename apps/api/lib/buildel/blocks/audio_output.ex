defmodule Buildel.Blocks.AudioOutput do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "audio_output",
      description:
        "It's designed to work seamlessly with other audio-related blocks in Buildel, ensuring smooth and flexible audio output capabilities in applications.",
      groups: ["audio", "inputs / outputs"],
      inputs: [Block.audio_input()],
      outputs: [Block.audio_output("output", true)],
      ios: [],
      dynamic_ios: nil,
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
        "opts" => options_schema()
      }
    }
  end

  @impl true
  def handle_input("input", {_topic, :binary, chunk, metadata}, state) do
    IO.inspect(chunk, label: "chunk")
    output(state, "output", {:binary, chunk}, %{metadata: metadata})
  end
end
