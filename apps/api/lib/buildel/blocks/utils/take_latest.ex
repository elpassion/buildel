defmodule Buildel.Blocks.Utils.TakeLatest do
  alias Buildel.Blocks.Utils.TakeLatest

  defmacro __using__(_opts) do
    quote do
      import TakeLatest

      defp assign_take_latest(state, reset \\ false) do
        messages =
          Enum.reduce(state[:opts].inputs, %{}, fn input, messages ->
            [input | _] = input |> String.split("->")
            messages |> Map.put(input, nil)
          end)

        state |> Keyword.put(tl_keyword(), messages) |> Keyword.put(tl_reset_keyword(), reset)
      end

      defp save_take_latest_message(state, topic, text) do
        ["context", _context, "block", block, "io", output] = String.split(topic, ":")
        [output | _] = output |> String.split("->")

        put_in(state, [tl_keyword(), "#{block}:#{output}"], text)
      end

      defp interpolate_template_with_take_latest_messages(state, template) do
        message =
          state[tl_keyword()]
          |> Enum.reduce(template, fn
            {_input, nil}, template -> template
            {input, text}, template -> String.replace(template, "{#{input}}", text)
          end)

        if message_filled?(message, state[:opts].inputs) do
          {state |> cleanup_messages(), message}
        else
          {state, nil}
        end
      end
    end
  end

  def tl_keyword(), do: :take_latest_messages
  def tl_reset_keyword(), do: :take_latest_reset

  def message_filled?(message, inputs) do
    !String.contains?(
      message,
      inputs |> Enum.map(fn input -> input |> String.split("->") |> List.first() end)
    )
  end

  def cleanup_messages(state) do
    if state[tl_reset_keyword()] do
      messages =
        Enum.reduce(state[:opts].inputs, %{}, fn input, messages ->
          messages |> Map.put(input, nil)
        end)

      Keyword.put(state, tl_keyword(), messages)
    else
      state
    end
  end
end
