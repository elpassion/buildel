defmodule Buildel.Blocks.Utils.TakeLatest do
  alias Buildel.Blocks.Connection
  alias Buildel.Blocks.Utils.TakeLatest

  defmacro __using__(_opts) do
    quote do
      import TakeLatest

      def input_values(state) do
        state |> Map.get(tl_keyword())
      end

      defp get_input_value(state, input_name) do
        connected_output =
          state.connections
          |> Enum.find(&(&1.to.name == input_name))

        connected_output_name =
          "#{connected_output.from.block_name}:#{connected_output.from.name}"

        case input_values(state) |> Map.get(connected_output_name) do
          nil ->
            {:error, "Input #{input_name} is not connected."}

          value ->
            {:ok, value}
        end
      end

      defp assign_take_latest(state) do
        messages = empty_inputs(state)
        state |> Map.put(tl_keyword(), messages)
      end

      defp save_latest_input_value(state, topic, text) do
        %{block: block, io: output} = Buildel.BlockPubSub.io_from_topic(topic)
        [output | _] = output |> String.split("->")

        put_in(state, [tl_keyword(), "#{block}:#{output}"], text)
      end

      defp replace_input_strings_with_latest_inputs_values(state, template) do
        state
        |> input_values()
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

      defp replace_input_strings_with_latest_inputs(state, template) do
        state
        |> input_values()
        |> Enum.reduce(template, fn
          {_input, nil}, template ->
            template

          {input, _text}, template ->
            String.replace(template, "{{#{input}}}", "\"#{input}\"")
        end)
      end
      defp tl_keyword(), do: :take_latest_messages

      defp all_inputs_in_string_filled?(nil, connections), do: true

      defp all_inputs_in_string_filled?(message, connections) do
        !String.contains?(
          message,
          connections
          |> Enum.map(fn connection ->
            "{{#{connection.from.block_name}:#{connection.from.name}}}"
          end)
        )
      end

      def cleanup_inputs(state) do
        new_messages =
          Map.merge(
            state |> Map.get(tl_keyword()),
            empty_inputs(state),
            fn key, old, new ->
              connection =
                state.connections
                |> Enum.find(fn connection ->
                  Connection.block_output_string(connection) == key
                end)

              if is_nil(connection) || connection.opts.reset do
                new
              else
                old
              end
            end
          )

        state |> Map.put(tl_keyword(), new_messages)
      end

      def empty_inputs(state) do
        Enum.into(state.connections, %{}, fn connection ->
          {Connection.block_output_string(connection), nil}
        end)
      end
    end
  end
end
