defmodule Buildel.Blocks.AudioInput do
  use Buildel.Blocks.Block

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

  def handle_input("input", {_topic, :binary, chunk, metadata}) do
    [
      {:start_stream, "output"},
      {:output, "output", {:binary, chunk, metadata}},
      {:stop_stream, "output"}
    ]
  end
end
