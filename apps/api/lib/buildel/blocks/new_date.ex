defmodule Buildel.Blocks.NewDate do
  use Buildel.Blocks.NewBlock

  defblock(:date,
    description: "An utility block that returns the current date and time (UTC).",
    groups: ["utils", "tools"]
  )

  definput(:input, schema: %{})
  defoutput(:output, schema: %{"type" => "string"})

  defoption(:additive_type, %{
    "type" => "string",
    "title" => "Additive type",
    "description" => "The type of additive to apply to the date.",
    "enum" => ["none", "second", "minute", "hour", "day", "week", "month", "year"],
    "enumPresentAs" => "radio",
    "default" => "none",
    "readonly" => true
  })

  defoption(:additive, %{
    "type" => "number",
    "title" => "Additive",
    "description" => "The amount of additive to apply to the date.",
    "step" => 1,
    "default" => 0
  })

  def handle_input(:input, %Message{} = message, state) do
    output(
      state,
      :output,
      message
      |> Message.from_message()
      |> Message.set_type(:text)
      |> Message.set_message(get_date(state))
    )

    {:ok, state}
  end

  defp get_date(state) do
    DateTime.utc_now()
    |> apply_additive(
      option(state, :additive_type),
      option(state, :additive)
    )
    |> DateTime.to_iso8601()
  end

  defp apply_additive(date, "none", _), do: date

  defp apply_additive(date, additive_type, additive),
    do: date |> DateTime.shift([{additive_type |> String.to_existing_atom(), additive}])
end
