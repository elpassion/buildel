defmodule Buildel.Blocks.TextInputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.TextInput

  describe "TextInput" do
    test "exposes options" do
      assert TextInput.options() == %{
               type: "text_input",
               description:
                 "This module is crafted for the seamless intake and transmission of textual data.",
               inputs: [Block.text_input("input", true), Block.text_input("forward")],
               outputs: [Block.text_output("output"), Block.text_output("forward", true, false)],
               schema: TextInput.schema(),
               groups: ["text", "inputs / outputs"],
               ios: [],
               dynamic_ios: nil
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(TextInput, %{"name" => "test", "opts" => %{}, "inputs" => []})

      assert {:error, _} = Blocks.validate_block(TextInput, %{})
    end

    test "broadcasts text" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            TextInput.create(%{
              name: "test",
              opts: %{},
              connections: []
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      {:ok, public_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "forward")

      text = "text"
      test_run |> BlocksTestRunner.Run.input("test", "input", {:text, text})
      assert_receive {^topic, :start_stream, nil, _}
      assert_receive {^topic, :text, ^text, _}
      assert_receive {^topic, :stop_stream, nil, _}

      assert_receive {^public_topic, :text, ^text, _}
    end
  end
end
