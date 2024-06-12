defmodule Buildel.Blocks.AudioInput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  def options() do
    %{
      type: "audio_input",
      description: "A specialized block designed for capturing and streaming audio data.",
      groups: ["audio", "inputs / outputs"],
      inputs: [Block.audio_input("input", true)],
      outputs: [Block.audio_output()],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "opts" => options_schema()
      }
    }
  end

  @impl true
  def handle_input("input", {_topic, :binary, chunk, metadata}, state) do
    output(state, "output", {:binary, chunk}, %{metadata: metadata})
  end
end
