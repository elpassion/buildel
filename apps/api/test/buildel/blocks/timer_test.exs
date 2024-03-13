defmodule Buildel.Blocks.TimerTest do
  use Buildel.BlockCase
  alias Blocks.Timer

  test "exposes options" do
    assert Timer.options() == %{
             description: "Used to emit a message after a specified time period.",
             type: "timer",
             inputs: [Block.text_input("start")],
             outputs: [Block.text_output("on_stop")],
             schema: Timer.schema(),
             groups: ["utils"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(Timer, %{
               "name" => "test",
               "opts" => %{
                 "time" => 1000
               }
             })

    assert {:error, _} = Blocks.validate_block(Timer, %{})
  end

  test "emits signal after specified time when started" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Timer.create(%{
            name: "test",
            opts: %{
              time: 10
            },
            connections: [
              Blocks.Connection.from_connection_string("text_input:output->start", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "on_stop")

    test_run
    |> BlocksTestRunner.Run.input(
      "text_input",
      "input",
      {:text, "whatever"}
    )

    assert_receive({^topic, :start_stream, nil})
    assert_receive({^topic, :text, "0"})
    assert_receive({^topic, :stop_stream, nil})
  end

  test "resets timer on second stream" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Timer.create(%{
            name: "test",
            opts: %{
              time: 10
            },
            connections: [
              Blocks.Connection.from_connection_string("text_input:output->start", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "on_stop")

    test_run
    |> BlocksTestRunner.Run.input(
      "text_input",
      "input",
      {:text, "whatever"}
    )

    test_run
    |> BlocksTestRunner.Run.input(
      "text_input",
      "input",
      {:text, "whatever2"}
    )

    assert_receive({^topic, :start_stream, nil})
    assert_receive({^topic, :text, "0"})
    assert_receive({^topic, :stop_stream, nil})
    refute_receive({^topic, :text, "0"})
  end
end
