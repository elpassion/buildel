defmodule Buildel.Blocks.NewCollectTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewCollect

  describe "Collect" do
    test "exposes options" do
      assert %Buildel.Blocks.Utils.Options{
               type: :collect_all_text,
               description:
                 "This module specializes in accumulating and consolidating text input from streaming sources.",
               groups: ["utils"]
             } = NewCollect.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewCollect, %{
                 name: "test_collect",
                 opts: %{}
               })

      assert {:error, _} = Blocks.validate_block(NewCollect, %{})
    end
  end

  describe "Collect Run" do
    setup [:create_run]

    test "accumulates text input", %{run: test_run} do
      message1 = Message.new(:text, "Hello")
      message2 = Message.new(:text, " World")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_collect")
      |> BlocksTestRunner.Run.input("test_collect", :input, message1)
      |> BlocksTestRunner.Run.input("test_collect", :input, message2)
      |> BlocksTestRunner.Run.stop_stream("test_collect", :input)
      |> assert_receive_message("test_collect", :output, Message.new(:text, "Hello World"))
    end

    test "handles input stream stop", %{run: test_run} do
      message = Message.new(:text, "Hello")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_collect")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message("test_collect", :output, Message.new(:text, "Hello"))
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewCollect.create(%{
              name: "test_collect",
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
