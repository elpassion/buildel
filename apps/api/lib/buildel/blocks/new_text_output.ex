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

  def handle_input(:input, %Message{type: :text} = message, state) do
    if filter_enabled?(state),
      do: send_error(state, "Did not apply filter because message is a String not a JSON.")

    with %Message{} = message <- format_message(message) do
      output(state, :output, message, stream_stop: :schedule)
      output(state, :forward, message, stream_stop: :schedule)
      {:ok, state}
    else
      {:error, error} ->
        send_error(state, error)
        {:ok, state}
    end
  end

  def handle_input(:input, %Message{type: :json} = message, state) do
    with %Message{} = message <- filter_message(state, message),
         %Message{} = message <- format_message(message) do
      output(state, :output, message, stream_stop: :schedule)
      output(state, :forward, message, stream_stop: :schedule)
      {:ok, state}
    else
      {:error, error} ->
        send_error(state, error)
        {:ok, state}
    end
  end

  def handle_input_stream_stop(:input, message, state) do
    send_stream_stop(state, :output, message)
    send_stream_stop(state, :forward, message)
    {:ok, state}
  end

  defp format_message(%Message{} = message) do
    case Message.to_string(message) do
      {:ok, message_message} ->
        Message.set_message(message, message_message) |> Message.set_type(:text)

      {:error, _} ->
        {:error, :invalid_input}
    end
  end

  defp filter_message(state, message) do
    if filter_enabled?(state), do: jq(message, option(state, :jq_filter)), else: message
  end

  defp filter_enabled?(state) do
    case option(state, :jq_filter) do
      nil -> false
      "" -> false
      "." -> false
      _filter -> true
    end
  end

  defp jq(%Message{} = message, filter) do
    with %Message{} = message <- format_message(message),
         {:ok, message_message} <- Buildel.JQ.query(message.message, filter),
         {:ok, message_message} <- Jason.decode(message_message) do
      Message.set_message(message, message_message) |> Message.set_type(:json)
    end
  end
end
