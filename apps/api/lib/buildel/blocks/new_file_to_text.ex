defmodule Buildel.Blocks.NewFileToText do
  use Buildel.Blocks.NewBlock
  use Buildel.Blocks.NewBlock.DocumentWorkflow

  defblock(:file_to_text,
    description: "Used for reading a content of a file and outputting it as text.",
    groups: ["file", "inputs / outputs"]
  )

  definput(:input, schema: %{"type" => "object"}, type: :file)
  defoutput(:output, schema: %{"type" => "string"})

  def handle_input(:input, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    with {:ok, content} <-
           document_workflow().get_content(message.message.path, message.message) do
      output(
        state,
        :output,
        Message.from_message(message) |> Message.set_type(:text) |> Message.set_message(content)
      )

      send_stream_stop(state, :output, message)

      {:ok, state}
    else
      {:error, "Error reading file"} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Error reading file")
        )

        {:ok, state}

      _ ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Unknown error")
        )

        {:ok, state}
    end
  end
end
