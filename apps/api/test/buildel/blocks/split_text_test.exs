defmodule Buildel.Blocks.SplitTextTest do
  use Buildel.BlockCase, async: true
  alias Blocks.SplitText

  test "exposes options" do
    assert SplitText.options() == %{
             type: "split_text",
             description:
               "It's an essential utility for processing large texts, enabling efficient text handling and manipulation in Buildel applications.",
             groups: ["utils", "text"],
             inputs: [Block.text_input()],
             outputs: [Block.text_output("output")],
             ios: [],
             schema: SplitText.schema(),
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(SplitText, %{
               "name" => "test",
               "opts" => %{
                 "chunk_size" => 5
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(SplitText, %{})
  end

  test "splits text" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          SplitText.create(%{
            name: "test",
            opts: %{
              chunk_size: 5
            },
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
    text = "11111111111"
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

    assert_receive {^topic, :start_stream, nil, _}
    assert_receive {^topic, :text, "11111", _}
    assert_receive {^topic, :text, "11111", _}
    assert_receive {^topic, :text, "1", _}
    refute_receive {^topic, :stop_stream, nil, _}
  end
end
