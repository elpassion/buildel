defmodule Buildel.Blocks.CollectSentences do
  require Logger
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate input(pid, chunk), to: __MODULE__, as: :save_text_chunk
  defdelegate text_output(name), to: Block
  defdelegate text_input(), to: Block
  def sentences_output(), do: text_output("sentences_output")

  @impl true
  def options() do
    %{
      type: "collect_sentences",
      groups: ["text", "utils"],
      inputs: [text_input()],
      outputs: [sentences_output()],
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

  def save_text_chunk(pid, {:text, _text} = chunk) do
    GenServer.cast(pid, {:save_text_chunk, chunk})
  end

  # Server

  @impl true
  def init(
        [
          name: _name,
          block_name: _block_name,
          context_id: context_id,
          type: __MODULE__,
          opts: opts
        ] = state
      ) do
    subscribe_to_inputs(context_id, opts.inputs)

    {:ok, state |> assign_stream_state |> Keyword.put(:text, "")}
  end

  @impl true
  def handle_cast({:save_text_chunk, {:text, text_chunk}}, state) do
    state = state |> send_stream_start("sentences_output")
    text = state[:text] <> text_chunk
    state = state |> Keyword.put(:text, text)

    sentences = text |> Essence.Chunker.sentences()

    state =
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
        |> Keyword.put(:text, new_text)
      else
        state
      end

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, message}, state) do
    input(self(), {:text, message})
    {:noreply, state}
  end

  def handle_stream_stop({_name, :stop_stream, _output}, state) do
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
      |> Keyword.put(:text, "")
      |> Keyword.put(:draining_again, false)
    end
  end

  defp drain_again(state) do
    state = Keyword.put(state, :draining_again, true)
    send(self(), {"", :stop_stream, "sentences_output"})
    state
  end
end
