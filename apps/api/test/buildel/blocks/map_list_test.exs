defmodule Buildel.Blocks.MapListTest do
  use Buildel.BlockCase, async: true
  alias Blocks.MapList

  test "exposes options" do
    assert MapList.options() == %{
             type: "map_list",
             description: "Used for mapping and transforming 1 input list into n outputs.",
             groups: ["utils"],
             inputs: [Block.text_input("list")],
             outputs: [Block.text_output()],
             ios: [],
             schema: MapList.schema()
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(MapList, %{
               "name" => "test",
               "opts" => %{},
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(MapList, %{})
  end

  test "splits text" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          MapList.create(%{
            name: "test",
            opts: %{},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->list", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
    text = ~s([1, 2, 3])
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

    assert_receive {^topic, :start_stream, nil, _}
    assert_receive {^topic, :text, "1", _}
    assert_receive {^topic, :text, "2", _}
    assert_receive {^topic, :text, "3", _}
    refute_receive {^topic, :stop_stream, nil, _}
  end
end
