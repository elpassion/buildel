defmodule Buildel.Blocks.NewTextOutput do
  alias Buildel.Blocks.Utils.Message
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.NewBlock

  defblock(:text_output,
    description: "A versatile module designed to output text data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, schema: %{"anyOf" => [%{"type" => "string"}, %{}]})

  defoutput(:output, schema: %{"type" => "string"}, public: true)
  defoutput(:forward, schema: %{"type" => "string"})

  defoption(:output_as, %{
    type: "string",
    title: "Output as type",
    description: "How to format the output.",
    enum: ["String", "JSON"],
    enumPresentAs: "radio",
    default: "String",
    readonly: true
  })

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
    with %Message{} = message <- filter_message(state, message),
         %Message{} = message <- format_message(message, option(state, :output_as)) do
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

  defp format_message(message, "String") do
    message |> Message.set_message(message.message |> to_string())
  rescue
    _e ->
      {:error,
       "Could not format message. If you are returning an object then format it as JSON in Text Output Block"}
  end

  defp format_message(message, "JSON") do
    case Jason.encode(message.message) do
      {:ok, message_message} -> Message.set_message(message, message_message)
      {:error, _} -> {:error, :invalid_input}
    end
  end

  defp filter_message(state, message) do
    case option(state, :jq_filter) do
      nil -> message
      "" -> message
      "." -> message
      filter -> jq(message, filter)
    end
  end

  defp jq(%Message{message: message_message} = message, filter) when is_binary(message_message) do
    with {:ok, new_message_message} <- Buildel.JQ.query(message.message, filter),
         {:ok, new_message_message} <- Jason.decode(new_message_message) do
      Message.set_message(message, new_message_message)
    end
  end

  defp jq(message, filter) do
    jq(format_message(message, "JSON"), filter)
  end
end
