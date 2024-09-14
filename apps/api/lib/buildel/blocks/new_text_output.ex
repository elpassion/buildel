defmodule Buildel.Blocks.NewTextOutput do
  alias Buildel.Blocks.Utils.Message
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.NewBlock

  defblock(:text_output,
    description: "A versatile module designed to output text data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, %{"type" => "string"})

  defoutput(:output, %{"type" => "string"}, public: true)
  defoutput(:forward, %{"type" => "string"})

  defoption(
    :jq_filter,
    EditorField.new(%{
      title: "JQ Filter",
      description: "JQ filter to apply to the response.",
      editorLanguage: "json",
      default: ".",
      minLength: 1
    })
  )

  def handle_input(:input, %Message{} = message, state) do
    with %Message{} = message <- filter_message(state, message) do
      output(state, :output, message, stream_stop: :schedule)
      output(state, :forward, message, stream_stop: :schedule)
      {:ok, state}
    else
      {:error, error} ->
        send_error(state, error)
        {:ok, state}
    end
  end

  def handle_input_stream_stop(:input, state) do
    send_stream_stop(state, :output)
    send_stream_stop(state, :forward)
    {:ok, state}
  end

  defp filter_message(state, message) do
    case option(state, :jq_filter) do
      nil -> message
      "" -> message
      "." -> message
      filter -> jq(message, filter)
    end
  end

  defp jq(message, filter) do
    case Buildel.JQ.query(message.message, filter) do
      {:ok, new_message_message} ->
        Message.set_message(message, new_message_message |> String.trim())

      error ->
        error
    end
  end
end
