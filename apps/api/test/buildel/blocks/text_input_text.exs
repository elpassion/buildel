defmodule Buildel.TextInputTest do
  use Buildel.DataCase

  alias Buildel.Blocks
  alias Buildel.Blocks.TextInput
  alias Buildel.BlocksTestRunner

  describe "TextInput" do
    test "exposes options" do
      assert TextInput.options() == %{
               type: "text_input",
               description:
                 "This module is crafted for the seamless intake and transmission of textual data.",
               inputs: [Block.text_input("input", true)],
               outputs: [Block.text_output("output")],
               schema: TextInput.schema(),
               groups: ["text", "inputs / outputs"],
               ios: []
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
              connections: [
                Blocks.Connection.from_connection_string("test:input->input", "text")
              ]
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
      text = "text"
      test_run |> BlocksTestRunner.Run.input("test", "input", {:text, text})
      assert_receive {^topic, :start_stream, nil}
      assert_receive {^topic, :text, ^text}
      assert_receive {^topic, :stop_stream, nil}
    end
  end
end
