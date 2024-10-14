defmodule Buildel.Blocks.NewDateTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewDate

  test "exposes options" do
    assert %{
             type: :date,
             description: "An utility block that returns the current date and time (UTC).",
             groups: ["utils", "tools"],
             inputs: [_],
             outputs: [_],
             ios: [],
             dynamic_ios: nil
           } = NewDate.options()
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(NewDate, %{
               name: "test",
               opts: %{
                 additive_type: "none",
                 additive: 0
               }
             })

    assert {:error, _} = Blocks.validate_block(NewDate, %{})
  end

  describe "Date Run" do
    setup [:create_run]

    test "returns time", %{run: test_run} do
      message = Message.new(:text, "")

      datetime = DateTime.utc_now()

      received_message =
        message
        |> Message.from_message()
        |> Message.set_message(datetime |> DateTime.to_iso8601())

      test_run
      |> BlocksTestRunner.with_datetime_set_to(datetime)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message("test", :output, received_message)
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewDate.create(%{
              name: "test",
              opts: %{},
              connections: [
                BlocksTestRunner.test_text_input_connection(:input)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
