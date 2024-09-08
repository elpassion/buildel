defmodule Buildel.Blocks.SplitBy do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "split_by",
      description: "Splits a list into two.",
      groups: ["utils"],
      inputs: [Block.text_input()],
      outputs: [Block.text_output("list1"), Block.text_output("list2")],
      ios: [],
      dynamic_ios: nil,
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "inputs", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => ["drain_signal", "join_as"],
            "properties" => Jason.OrderedObject.new([])
          })
      }
    }
  end

  @impl true
  def setup(%{type: __MODULE__} = state) do
    {:ok, state}
  end

  @impl true
  def handle_input("input", {_name, :text, message, _metadata}, state) do
    list = message |> Jason.decode!()
    IO.puts("DUPA")
    split_list(list, state)
  end

  defp split_list(list, state) do
    len = round(length(list) / 2)
    {list1, list2} = Enum.split(list, len)

    state
    |> output("list1", {:text, list1 |> Jason.encode!()})
    |> output("list2", {:text, list2 |> Jason.encode!()})
  end
end
