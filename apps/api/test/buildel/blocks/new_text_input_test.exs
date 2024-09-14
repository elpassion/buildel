defmodule Buildel.Blocks.NewTextInputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewTextInput

  describe "TextInput" do
    test "exposes options" do
      assert %{
               type: :text_input,
               description:
                 "This module is crafted for the seamless intake and transmission of textual data.",
               inputs: [_, _],
               outputs: [_],
               groups: ["text", "inputs / outputs"],
               ios: [],
               dynamic_ios: nil
             } = NewTextInput.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewTextInput, %{
                 name: "test",
                 opts: %{}
               })

      assert {:error, _} = Blocks.validate_block(NewTextInput, %{})
    end
  end

  describe "TextInput Run" do
    setup [:create_run]

    test "validates input", %{run: test_run} do
      {:ok, _topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", :output)
      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_block("test")
      message = Message.new(:raw, %{})
      test_run |> BlocksTestRunner.test_text_input(message)
      assert_receive_error(topic, :invalid_input)
    end

    test "outputs text", %{run: test_run} do
      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", :output)
      text = "text"
      message = Message.new(:raw, text)
      test_run |> BlocksTestRunner.Run.input("test", :input, message)

      assert_receive_message(topic, message)
    end

    test "forwards text", %{run: test_run} do
      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", :output)
      text = "text"
      message = Message.new(:raw, text)
      test_run |> BlocksTestRunner.test_text_input(message)

      assert_receive_message(topic, message)
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewTextInput.create(%{
              name: "test",
              opts: %{},
              connections: [
                BlocksTestRunner.test_text_input_connection(:forward)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
