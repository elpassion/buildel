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
        Block.audio_input("unmute")
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
            "required" => [],
            "properties" => %{
              file_type: %{
                "type" => "string",
                "title" => "File type",
                "description" => "The type of file to be processed.",
                "enum" => ["wav", "mp3", "mp4", "webm", "mpeg"],
                "enumPresentAs" => "radio",
                "default" => "wav"
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
      case metadata do
        %{file_name: _, file_type: _, file_id: _} ->
          # Chunk is a file path, read the file
          case File.read(chunk) do
            {:ok, file_content} ->
              output(state, "output", {:binary, file_content}, %{metadata: metadata})

            {:error, _reason} ->
              send_error(state, "Failed to read file: #{chunk}")
          end

        _ ->
          # Chunk is already binary audio data
          if state[:opts][:file_type] do
            metadata = metadata |> Map.put(:file_name, "audio.#{state[:opts][:file_type]}")
            output(state, "output", {:binary, chunk}, %{metadata: metadata})
          else
            output(state, "output", {:binary, chunk}, %{metadata: metadata})
          end
      end
    end
  end

  @impl true
  def handle_input("mute", {_topic, :text, _chunk, metadata}, state) do
    state |> Map.put(:mute, true) |> output("status", {:text, "muted"}, %{metadata: metadata})
  end

  @impl true
  def handle_input("unmute", {_topic, :binary, _chunk, metadata}, state) do
    state |> Map.put(:mute, false) |> output("status", {:text, "unmuted"}, %{metadata: metadata})
  end
end
