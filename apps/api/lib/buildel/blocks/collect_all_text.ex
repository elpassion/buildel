defmodule Buildel.Blocks.CollectAllText do
  require Logger
  use Buildel.Blocks.Block

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :save_text_chunk

  @impl true
  def options() do
    %{
      type: "collect_all_text",
      description: "This module specializes in accumulating and consolidating text input from streaming sources.",
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

  # Client

  def save_text_chunk(pid, {:text, _text} = chunk) do
    GenServer.cast(pid, {:save_text_chunk, chunk})
  end

  # Server

  @impl true
  def init(%{context_id: context_id, type: __MODULE__} = state) do
    subscribe_to_connections(context_id, state.connections)

    {:ok, state |> assign_stream_state |> Map.put(:text, "")}
  end

  @impl true
  def handle_cast({:save_text_chunk, {:text, text_chunk}}, state) do
    state = state |> send_stream_start("output")
    text = state[:text] <> text_chunk
    state = state |> Map.put(:text, text)

    {:noreply, state}
  end

  @impl true
  def handle_info({_name, :text, message}, state) do
    cast(self(), {:text, message})
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

      Buildel.BlockPubSub.broadcast_to_io(
        state[:context_id],
        state[:block_name],
        "output",
        {:text, text}
      )

      state
      |> send_stream_stop("output")
      |> Map.put(:text, "")
      |> Map.put(:draining_again, false)
    end
  end

  defp drain_again(state) do
    state = Map.put(state, :draining_again, true)
    send(self(), {"", :stop_stream, "output"})
    state
  end
end
