defmodule Buildel.Blocks.NewTextInput do
  use Buildel.Blocks.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, schema: %{"type" => "string"}, public: true)
  definput(:forward, schema: %{"type" => "string"})

  defoutput(:output, schema: %{"anyOf" => [%{"type" => "string"}, %{}]})

  defoption(:output_as, %{
    type: "string",
    title: "Output as type",
    description: "How other blocks should interpret the output.",
    enum: ["String", "JSON"],
    enumPresentAs: "radio",
    default: "String",
    readonly: true
  })

  def handle_input(:input, %Message{} = message, state) do
    case parse_message(message, option(state, :output_as)) do
      %Message{} = message ->
        output(state, :output, message)
        {:ok, state}

      {:error, :invalid_input} ->
        send_error(state, :invalid_input)
        {:ok, state}
    end
  end

  def handle_input(:forward, %Message{} = message, state) do
    case parse_message(message, option(state, :output_as)) do
      %Message{} = message ->
        output(state, :output, message)
        {:ok, state}

      {:error, :invalid_input} ->
        send_error(state, :invalid_input)
        {:ok, state}
    end
  end

  defp parse_message(message, "String"), do: message |> Message.set_type(:text)

  defp parse_message(message, "JSON") do
    case Jason.decode(message.message) do
      {:ok, message_message} ->
        message |> Message.set_message(message_message) |> Message.set_type(:json)

      {:error, _} ->
        {:error, :invalid_input}
    end
  end
end
