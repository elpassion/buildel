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
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(NewTextInput, %{})
    end

    test "broadcasts text" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewTextInput.create(%{
              name: "test",
              opts: %{},
              connections: []
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
      text = "text"
      test_run |> BlocksTestRunner.Run.input("test", "input", Message.new(:raw, text))
      assert_receive {^topic, :start_stream, nil, _}

      assert_receive %Message{
        type: :raw,
        message: ^text,
        topic: ^topic,
        metadata: %{message_id: _}
      }

      assert_receive {^topic, :stop_stream, nil, _}
    end
  end
end
