defmodule Buildel.Blocks.TextOutputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.TextOutput

  test "exposes options" do
    assert TextOutput.options() == %{
             description: "A versatile module designed to output text data.",
             type: "text_output",
             inputs: [Block.text_input("input")],
             outputs: [Block.text_output("output", true)],
             schema: TextOutput.schema(),
             groups: ["text", "inputs / outputs"],
             ios: [],
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(TextOutput, %{
               "name" => "test",
               "opts" => %{
                 "stream_timeout" => 500
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(TextOutput, %{})
  end

  test "broadcasts text" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          TextOutput.create(%{
            name: "test",
            opts: %{},
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
    text = "text"
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, text})

    assert_receive {^topic, :start_stream, nil, _}
    assert_receive {^topic, :text, ^text, _}
    assert_receive {^topic, :stop_stream, nil, _}
  end
end
