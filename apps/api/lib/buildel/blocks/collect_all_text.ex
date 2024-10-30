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
      inputs: [Block.text_input(), Block.text_input("drain"), Block.text_input("reset")],
      outputs: [Block.text_output()],
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
        "opts" =>
          options_schema(%{
            "required" => ["drain_signal", "join_as"],
            "properties" =>
              Jason.OrderedObject.new(
                join_as: %{
                  "type" => "string",
                  "description" => "The type of output of collecting",
                  "default" => "string",
                  "enum" => ["string", "list"],
                  "enumPresentAs" => "radio",
                  "readonly" => true
                },
                drain_signal: %{
                  "type" => "string",
                  "description" => "The signal type to stop collecting while.",
                  "default" => "any",
                  "enum" => ["any", "drain"],
                  "enumPresentAs" => "radio",
                  "readonly" => true
                },
                reset_signal: %{
                  "type" => "string",
                  "description" => "The signal type to reset collecting while.",
                  "default" => "any",
                  "enum" => ["any", "reset"],
                  "enumPresentAs" => "radio",
                  "readonly" => true
                }
              )
          })
      }
    }
  end

  @impl true
  def setup(%{type: __MODULE__} = state) do
    state =
      state
      |> Map.put(:drain_signal, state.opts[:drain_signal] || "any")
      |> Map.put(:reset_signal, state.opts[:reset_signal] || "any")
      |> Map.put(:join_as, state.opts[:join_as] || "string")
      |> put_acc()

    {:ok, state}
  end

  @impl true
  def handle_input("input", {_name, :text, message, _metadata}, state) do
    save_text_chunk(message, state)
  end

  @impl true
  def handle_input("drain", {_name, :text, _message, _metadata}, state) do
    drain_text(state)
  end

  @impl true
  def handle_input("reset", {_name, :text, _message, _metadata}, state) do
    state |> put_acc()
  end

  def handle_stream_stop(
        {_name, :stop_stream, _output, _metadata},
        %{drain_signal: "any"} = state
      ) do
    state = drain_text(state)
    {:noreply, state}
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    {:noreply, state}
  end

  defp put_acc(%{join_as: "list"} = state), do: Map.put(state, :acc, [])
  defp put_acc(%{join_as: "string"} = state), do: Map.put(state, :acc, "")
  defp get_acc_message(%{join_as: "list", acc: list}), do: list |> Jason.encode!()
  defp get_acc_message(%{join_as: "string", acc: text}), do: text

  defp save_text_chunk(text_chunk, %{join_as: "string"} = state) do
    state = state |> send_stream_start("output")
    text = state[:acc] <> text_chunk

    state |> Map.put(:acc, text)
  end

  defp save_text_chunk(text_chunk, %{join_as: "list"} = state) do
    state = state |> send_stream_start("output")
    list = state[:acc] ++ [text_chunk]

    state |> Map.put(:acc, list)
  end

  defp drain_text(%{acc: "", draining_again: false} = state), do: drain_again(state)

  defp drain_text(%{acc: [], draining_again: false} = state), do: drain_again(state)

  defp drain_text(state) do
    text = get_acc_message(state)

    state = state |> output("output", {:text, text})

    if state[:reset_signal] == "any" do
      state |> put_acc() |> Map.put(:draining_again, false)
    else
      state |> Map.put(:draining_again, false)
    end
  end

  defp drain_again(state) do
    state
    |> Map.put(:draining_again, true)
    |> drain_text()
  end
end
