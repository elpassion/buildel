defmodule Buildel.Blocks.IFTest do
  use Buildel.BlockCase, async: true
  alias Blocks.IF

  test "exposes options" do
    assert IF.options() == %{
             type: "if",
             description:
               "Use this block to compare the input to a condition and forward the input to the true or false output.",
             groups: ["utils"],
             inputs: [Block.text_input()],
             outputs: [Block.text_output("true"), Block.text_output("false")],
             ios: [],
             schema: IF.schema(),
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(IF, %{
               "name" => "test",
               "opts" => %{
                 "condition" => "test"
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(IF, %{})
  end

  test "broadcasts text through correct output" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_input"),
          IF.create(%{
            name: "test",
            opts: %{
              condition: "test"
            },
            connections: [
              Blocks.Connection.from_connection_string("test_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, true_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "true")
    {:ok, false_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "false")
    true_text = "test"
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, true_text})

    assert_receive {^true_topic, :start_stream, nil, _}
    assert_receive {^true_topic, :text, ^true_text, _}
    assert_receive {^true_topic, :stop_stream, nil, _}
    refute_receive {^false_topic, :start_stream, nil, _}
    refute_receive {^false_topic, :text, ^true_text, _}
    refute_receive {^false_topic, :stop_stream, nil, _}

    false_text = "false"
    test_run |> BlocksTestRunner.Run.input("test_input", "input", {:text, false_text})
    assert_receive {^false_topic, :start_stream, nil, _}
    assert_receive {^false_topic, :text, ^false_text, _}
    assert_receive {^false_topic, :stop_stream, nil, _}
    refute_receive {^true_topic, :start_stream, nil, _}
    refute_receive {^true_topic, :text, ^false_text, _}
    refute_receive {^true_topic, :stop_stream, nil, _}
  end
end
