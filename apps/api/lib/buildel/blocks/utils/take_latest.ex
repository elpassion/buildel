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
    end
  end
end
