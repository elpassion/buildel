defmodule Buildel.Blocks.NewMap do
  alias Buildel.Blocks.Fields.EditorField
  use Buildel.Blocks.NewBlock

  defblock(:map_inputs,
    description: "Used to map the latest inputs and combine them based on a specified template.",
    groups: ["text", "utils"]
  )

  definput(:input, schema: %{})
  defoutput(:output, schema: %{})

  defoption(
    :template,
    EditorField.new(%{
      readonly: true,
      title: "template",
      description: "JQ template for combining texts.",
      type: "string",
      minLength: 1,
      default: "."
    })
  )

  def handle_input(:input, %Message{} = message, state) do
    with {:ok, state} <- save_input_message(state, message),
         {:ok, latest_messages_json} <- build_latest_messages_json(state),
         {:ok, filter, state} <- fill_filter_template(state),
         {:ok, %Message{} = new_message, state} <-
           filter_messages(state, latest_messages_json, filter) do
      output(
        state,
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(new_message.type)
        |> Message.set_message(new_message.message)
      )

      {:ok, state}
    else
      {:error, :template_not_filled, state} ->
        {:ok, state}

      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        {:ok, state}
    end
  end

  defp save_input_message(state, message) do
    latest_messages =
      state
      |> Map.get_lazy(:latest_messages, fn -> initial_latest_messages(state) end)
      |> Map.put(message.topic, message)

    {:ok, state |> Map.put(:latest_messages, latest_messages)}
  end

  defp initial_latest_messages(state) do
    state.block.connections
    |> Enum.map(fn %{from: %{block_name: block_name, name: name}} ->
      {Buildel.BlockPubSub.io_topic(state.context.context_id, block_name, name), nil}
    end)
    |> Enum.into(%{})
  end

  defp fill_filter_template(state) do
    case fill_filter_template_with_messages(state.latest_messages, option(state, :template)) do
      :error ->
        {:error, :template_not_filled, state}

      template ->
        state = Map.put(state, :latest_messages, initial_latest_messages(state))
        {:ok, template, state}
    end
  end

  defp fill_filter_template_with_messages(latest_messages, template) do
    latest_messages_to_inputs(latest_messages)
    |> Enum.reduce(template, &fill_filter_template_with_message/2)
  end

  defp fill_filter_template_with_message(_, :error) do
    :error
  end

  defp fill_filter_template_with_message({input, nil}, template) do
    if String.contains?(template, "{{#{input}}}"), do: :error, else: template
  end

  defp fill_filter_template_with_message({input, _}, template) do
    String.replace(template, "{{#{input}}}", "\"#{input}\"")
  end

  defp latest_messages_to_inputs(latest_messages) do
    latest_messages
    |> Enum.map(fn {topic, message} ->
      %{block: block, io: output} = Buildel.BlockPubSub.io_from_topic(topic)
      {"#{block}:#{output}", message}
    end)
    |> Enum.into(%{})
  end

  defp build_latest_messages_json(state) do
    {:ok,
     state
     |> Map.get(:latest_messages)
     |> latest_messages_to_inputs()
     |> Jason.encode!()}
  end

  defp filter_messages(state, messages_json, filter) do
    with {:ok, message} <- Buildel.JQ.query(messages_json, filter),
         {:ok, message} <- Jason.decode(message) do
      {:ok, Message.new(:json, message), state}
    else
      {:error, %Jason.DecodeError{}} ->
        {:error, "Failed to parse message to JSON. Ensure your output is a valid JSON", state}

      {:error, reason} ->
        {:error, reason, state}
    end
  end
end
