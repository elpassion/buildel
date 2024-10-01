defmodule Buildel.Blocks.AudioInput do
  use Buildel.Blocks.Block

  # Config

  @impl true
  def options() do
    %{
      type: "audio_input",
      description: "A specialized block designed for capturing and streaming audio data.",
      groups: ["audio", "inputs / outputs"],
      inputs: [
        Block.audio_input("input", true),
        Block.text_input("mute"),
        Block.audio_input("unmute"),
        Block.text_input("trigger")
      ],
      outputs: [Block.audio_output(), Block.text_output("status", true, false)],
      ios: [],
      dynamic_ios: nil,
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
        "opts" =>
          options_schema(%{
            "required" => ["store_audio"],
            "properties" => %{
              store_audio: %{
                "type" => "boolean",
                "title" => "Store audio",
                "description" => "Store audio",
                "default" => false
              }
            }
          })
      }
    }
  end

  @impl true
  def setup(%{type: __MODULE__} = state) do
    state = state |> Map.put(:mute, false)
    {:ok, state}
  end

  @impl true
  def handle_input("input", {_topic, :binary, chunk, metadata}, state) do
    if state[:mute] do
      state
    else
      state =
        if state.opts[:store_audio] do
          audio = Map.get(state, :audio)

          if audio do
            Map.put(state, :audio, audio ++ chunk)
          else
            state |> Map.put(:audio, chunk)
          end
        else
          state
        end

      output(state, "output", {:binary, chunk}, %{metadata: metadata})
    end
  end

  @impl true
  def handle_input("trigger", {_topic, :text, _, metadata}, state) do
    if state[:mute] do
      state
    else
      audio = state.audio
      output(state, "output", {:binary, audio}, %{metadata: metadata})
    end
  end

  @impl true
  def handle_input("mute", {_topic, :text, chunk, metadata}, state) do
    state |> Map.put(:mute, true) |> output("status", {:text, "muted"}, %{metadata: metadata})
  end

  @impl true
  def handle_input("unmute", {_topic, :binary, chunk, metadata}, state) do
    state |> Map.put(:mute, false) |> output("status", {:text, "unmuted"}, %{metadata: metadata})
  end
end
