defmodule Buildel.Blocks.CollectSentences do
  require Logger
  use Buildel.Blocks.Block

  # Config

  defp sentences_output(), do: Block.text_output("sentences_output")

  @impl true
  def options() do
    %{
      type: "collect_sentences",
      description:
        "This module segmenting and extracting individual sentences from continuous text streams.",
      groups: ["text", "utils"],
      inputs: [Block.text_input()],
      outputs: [sentences_output()],
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
        "inputs" => inputs_schema(),
        "opts" => options_schema()
      }
    }
  end

  # Client

  @impl true
  def setup(%{type: __MODULE__} = state) do
    {:ok, state |> Map.put(:text, "")}
  end

  defp save_text_chunk(text_chunk, state) do
    state = state |> send_stream_start("sentences_output")
    text = state[:text] <> text_chunk
    state = state |> Map.put(:text, text)

    sentences = text |> Essence.Chunker.sentences()

    if Enum.count(sentences) > 1 do
      sentence = sentences |> List.first()

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "sentences_output",
        {:text, sentence}
      )

      new_text = text |> String.replace(sentence, "") |> String.trim()

      state
      |> Map.put(:text, new_text)
    else
      state
    end
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
      sentences = text |> Essence.Chunker.sentences()

      sentences
      |> Enum.filter(&(&1 != ""))
      |> Enum.each(fn sentence ->
        Buildel.BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          "sentences_output",
          {:text, sentence}
        )
      end)

      state
      |> send_stream_stop("sentences_output")
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
