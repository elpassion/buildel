defmodule Buildel.Blocks.NewMapList do
  use Buildel.Blocks.NewBlock

  defblock(:map_list,
    description:
      "Used for mapping and transforming 1 input list into n outputs.",
    groups: ["utils"]
  )

  definput(:list, schema: %{"type" => "array"})

  defoutput(:output, schema: %{})

  defp map(%Message{message: list} = message, state) do
    list
    |> Enum.each(
      &output(state, :output, message |> Message.set_message(&1 |> Jason.encode!()) |> Message.set_type(:text))
    )
  end

  def handle_input(:list, %Message{} = message, state) do
    send_stream_start(state, :output, message)

    map(message, state)

    {:ok, state}
  end
end
