defmodule Buildel.Blocks.DateTest do
  use Buildel.BlockCase, async: true
  alias Blocks.Date

  test "exposes options" do
    assert Date.options() == %{
             type: "date",
             description: "An utility block that returns the current date and time (UTC).",
             groups: ["utils", "inputs / outputs", "tools"],
             inputs: [Block.text_input()],
             outputs: [Block.text_output()],
             ios: [Block.io("tool", "worker")],
             schema: Date.schema(),
             dynamic_ios: nil
           }
  end

  test "outputs current date" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_text_input_block("test_text_input"),
          Date.create(%{
            name: "test",
            opts: %{},
            connections: [
              Blocks.Connection.from_connection_string("test_text_input:output->input", "input")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    test_run
    |> BlocksTestRunner.Run.input("test_text_input", "input", {:text, " "})

    current_date = Elixir.Date.utc_today()

    assert_receive {^topic, :start_stream, nil, _}

    assert_receive {^topic, :text, block_date, _}

    assert_receive {^topic, :stop_stream, nil, _}

    {:ok, block_date, _} = block_date |> DateTime.from_iso8601()

    assert :eq ==
             Elixir.Date.compare(
               block_date |> DateTime.to_date(),
               current_date
             )
  end
end
