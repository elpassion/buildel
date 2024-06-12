defmodule Buildel.Blocks.MapList do
  use Buildel.Blocks.Block

  @impl true
  def options() do
    %{
      type: "map_list",
      description: "Used for mapping and transforming 1 input list into n outputs.",
      groups: ["utils"],
      inputs: [Block.text_input("list")],
      outputs: [Block.text_output()],
      ios: [],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => Jason.OrderedObject.new([])
          })
      }
    }
  end

  defp map(text, state) do
    case Jason.decode(text) do
      {:ok, list} -> do_map(list, state)
      {:error, _} -> do_map([], state)
    end
  end

  defp do_map(list, state) do
    list
    |> Enum.each(&output(state, "output", {:text, &1 |> Jason.encode!()}, %{stream_stop: :none}))
  end

  @impl true
  def handle_input("input", {_name, :text, text, _metadata}, state) do
    map(text, state)
    state
  end
end
