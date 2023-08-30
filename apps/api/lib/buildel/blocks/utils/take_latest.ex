defmodule Buildel.Blocks.Utils.TakeLatest do
  defmacro __using__(_opts) do
    quote do
      defp assign_take_latest(state, reset \\ false) do
        messages =
          Enum.reduce(state[:opts].inputs, %{}, fn input, messages ->
            [input | _] = input |> String.split("->")
            messages |> Map.put(input, nil)
          end)

        state |> Keyword.put(:messages, messages) |> Keyword.put(:reset, reset)
      end

      defp save_take_latest_message(state, topic, text) do
        ["context", _context, "block", block, "io", output] = String.split(topic, ":")
        [output | _] = output |> String.split("->")

        put_in(state, [:messages, "#{block}:#{output}"], text)
      end

      defp interpolate_template_with_take_latest_messages(state, template) do
        message =
          state[:messages]
          |> Enum.reduce(template, fn
            {_input, nil}, template -> template
            {input, text}, template -> String.replace(template, "{#{input}}", text)
          end)

        if Buildel.Blocks.Utils.TakeLatest.message_filled?(message, state[:opts].inputs) do
          {state |> Buildel.Blocks.Utils.TakeLatest.cleanup_messages(), message}
        else
          {state, nil}
        end
      end
    end
  end

  def message_filled?(message, inputs) do
    !String.contains?(
      message,
      inputs |> Enum.map(fn input -> input |> String.split("->") |> List.first() end)
    )
  end

  def cleanup_messages(state) do
    if state[:reset] do
      messages =
        Enum.reduce(state[:opts].inputs, %{}, fn input, messages ->
          messages |> Map.put(input, nil)
        end)

      Keyword.put(state, :messages, messages)
    else
      state
    end
  end
end
