defmodule Buildel.Blocks.NewDate do
  use Buildel.Blocks.NewBlock

  defblock(:date,
    description: "An utility block that returns the current date and time (UTC).",
    groups: ["utils", "tools"]
  )

  definput(:input, schema: %{})
  defoutput(:output, schema: %{"type" => "string"})

  def handle_input(:input, %Message{}, state) do
    output(state, :output, Message.new(:text, get_date()))
    {:ok, state}
  end

  defp get_date() do
    DateTime.utc_now() |> DateTime.to_string()
  end
end
