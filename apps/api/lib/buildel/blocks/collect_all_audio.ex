defmodule Buildel.Blocks.CollectAllAudio do
  require Logger
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "collect_all_audio",
      description:
        "This module specializes in accumulating and consolidating audio input from streaming sources.",
      groups: ["audio", "utils"],
      inputs: [Block.audio_input()],
      outputs: [Block.audio_output()],
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
  def setup(%{type: __MODULE__} = state), do: {:ok, state |> Map.put(:audio, <<>>)}

  defp save_audio_chunk(audio_chunk, state) do
    state = state |> send_stream_start("output")
    audio = state[:audio] <> audio_chunk
    state |> Map.put(:audio, audio)
  end

  @impl true
  def handle_input("input", {_name, :binary, chunk, _metadata}, state) do
    save_audio_chunk(chunk, state)
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    state = drain_audio(state)
    {:noreply, state}
  end

  defp drain_audio(state) do
    if state[:audio] == <<>> && !state[:draining_again] do
      IO.inspect("Draining again")
      drain_again(state)
    else
      audio = state[:audio]

      state
      |> output("output", {:binary, audio})
      |> Map.put(:audio, <<>>)
      |> Map.put(:draining_again, false)
    end
  end

  defp drain_again(state) do
    state
    |> Map.put(:draining_again, true)
    |> drain_audio()
  end
end
