defmodule Buildel.Blocks.TextOutput do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "text_output",
      description: "A versatile module designed to output text data.",
      groups: ["text", "inputs / outputs"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("output", true), Block.text_output("forward")],
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
            "required" => ["stream_timeout"],
            "properties" =>
              Jason.OrderedObject.new(
                stream_timeout: %{
                  "type" => "number",
                  "title" => "Stop after (ms)",
                  "description" =>
                    "Wait this many milliseconds after receiving the last chunk before stopping the stream.",
                  "minimum" => 500,
                  "default" => 5000,
                  "step" => 1
                },
                jq_filter:
                  EditorField.new(%{
                    title: "JQ Filter",
                    description: "JQ filter to apply to the response.",
                    editorLanguage: "json",
                    default: ".",
                    minLength: 1
                  })
              )
          })
      }
    }
  end

  @impl true
  def setup(state) do
    normalized_filter =
      case state.opts[:jq_filter] do
        nil -> nil
        "" -> nil
        "." -> nil
        filter -> filter
      end

    {:ok, state |> Map.put(:filter, normalized_filter)}
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    text =
      if state.filter do
        Buildel.JQ.query!(text, state.filter) |> String.trim()
      else
        text
      end

    state
    |> output("output", {:text, text}, %{stream_stop: :schedule})
    |> output("forward", {:text, text}, %{stream_stop: :schedule})
  end

  def handle_stream_stop({_name, :stop_stream, _output, _metadata}, state) do
    state = send_stream_stop(state, "output") |> send_stream_stop("forward")
    {:noreply, state}
  end
end
