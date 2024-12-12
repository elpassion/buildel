defmodule Buildel.Blocks.NewTextInput do
  use Buildel.Blocks.NewBlock

  defblock(:text_input,
    description:
      "This module is crafted for the seamless intake and transmission of textual data.",
    groups: ["text", "inputs / outputs"]
  )

  definput(:input, schema: %{"type" => "string"}, public: true)
  definput(:forward, schema: %{"type" => "string"})

  defoutput(:forward, schema: %{"anyOf" => [%{"type" => "string"}, %{}]}, public: true, visible: false)

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

  defoption(
    :default,
    %{
      type: "string",
      title: "Default Value",
      description: "Default Value to output at start of run",
      readonly: true
    },
    required: false
  )

  def handle_input(:input, %Message{} = message, state) do
    handle_message(message, state)
  end

  def handle_input(:forward, %Message{} = message, state) do
    handle_message(message, state)
  end

  def handle_start(state) do
    default = option(state, :default)

    case default do
      nil ->
        {:ok, state}

      "" ->
        {:ok, state}

      content ->
        message = Message.new(:text, content)
        handle_message(message, state)
    end
  end

  defp handle_message(message, state) do
    case parse_message(message, option(state, :output_as)) do
      %Message{} = message ->
        output(state, :forward, message)
        output(state, :output, message)
        {:ok, state}

      {:error, :invalid_input} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(:invalid_input)
        )

        {:ok, state}
    end
  end

  defp parse_message(message, "String"), do: message |> Message.set_type(:text)

  defp parse_message(%Message{message: nil}, "JSON") do
    {:error, :invalid_input}
  end

  defp parse_message(%Message{message: ""}, "JSON") do
    {:error, :invalid_input}
  end

  defp parse_message(message, "JSON") do
    case Jason.decode(message.message) do
      {:ok, message_message} ->
        message |> Message.set_message(message_message) |> Message.set_type(:json)

      {:error, _} ->
        {:error, :invalid_input}
    end
  end
end
