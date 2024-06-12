defmodule Buildel.Blocks.CollectAllText do
  require Logger
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "collect_all_text",
      description:
        "This module specializes in accumulating and consolidating text input from streaming sources.",
      groups: ["text", "utils"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output()],
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
        "opts" => options_schema()
      }
    }
  end

  @impl true
  def setup(%{type: __MODULE__} = state), do: {:ok, state |> Map.put(:text, "")}

  defp save_text_chunk(text_chunk, state) do
    state = state |> send_stream_start("output")
    text = state[:text] <> text_chunk
    state |> Map.put(:text, text)
  end

  @impl true
  def handle_input("input", {_name, :text, message, _metadata}, state) do
    save_text_chunk(message, state)
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    state = drain_text(state)
    {:noreply, state}
  end

  defp drain_text(state) do
    if state[:text] == "" && !state[:draining_again] do
      drain_again(state)
    else
      text = state[:text]

      state
      |> output("output", {:text, text})
      |> Map.put(:text, "")
      |> Map.put(:draining_again, false)
    end
  end

  defp drain_again(state) do
    state
    |> Map.put(:draining_again, true)
    |> drain_text()
  end
end
