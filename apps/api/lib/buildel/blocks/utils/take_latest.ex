defmodule Buildel.Blocks.Utils.TakeLatest do
  alias Buildel.Blocks.Connection
  alias Buildel.Blocks.Utils.TakeLatest

  defmacro __using__(_opts) do
    quote do
      import TakeLatest

      defp assign_take_latest(state) do
        messages = empty_messages(state)
        state |> Map.put(tl_keyword(), messages)
      end

      defp save_take_latest_message(state, topic, text) do
        %{block: block, io: output} = Buildel.BlockPubSub.io_from_topic(topic)
        [output | _] = output |> String.split("->")

        put_in(state, [tl_keyword(), "#{block}:#{output}"], text)
      end

      defp replace_inputs_with_take_latest_messages(state, template) do
        state[tl_keyword()]
        |> Enum.reduce(template, fn
          {_input, nil}, template ->
            template

          {input, text}, template ->
            text_string =
              if is_map(text) do
                Jason.encode!(text)
              else
                text
              end

            String.replace(template, "{{#{input}}}", text_string)
        end)
      end

      defp interpolate_template_with_take_latest_messages(state, template) do
        message = replace_inputs_with_take_latest_messages(state, template)

        if message_filled?(message, state.connections) do
          {state |> cleanup_messages(), message}
        else
          {state, nil}
        end
      end
    end
  end

  def tl_keyword(), do: :take_latest_messages

  def message_filled?(message, connections) do
    !String.contains?(
      message,
      connections
      |> Enum.map(fn connection ->
        "#{connection.from.block_name}:#{connection.from.name}"
      end)
    )
  end

  def cleanup_messages(state) do
    new_messages =
      Map.merge(
        state |> Map.get(tl_keyword()),
        empty_messages(state),
        fn key, old, new ->
          connection =
            state.connections
            |> Enum.find(fn connection -> Connection.block_output_string(connection) == key end)

          if is_nil(connection) || connection.opts.reset do
            new
          else
            old
          end
        end
      )

    state |> Map.put(tl_keyword(), new_messages)
  end

  def empty_messages(state) do
    Enum.into(state.connections, %{}, fn connection ->
      {Connection.block_output_string(connection), nil}
    end)
  end
end
