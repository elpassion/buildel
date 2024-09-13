defmodule Buildel.Blocks.NewTextOutputTest do
  alias Buildel.Blocks.NewTextInput
  use Buildel.BlockCase, async: true
  alias Blocks.NewTextOutput

  describe "TextOutput" do
    test "exposes options" do
      assert %{
               type: :text_output,
               description: "A versatile module designed to output text data.",
               inputs: [_],
               outputs: [_, _],
               groups: ["text", "inputs / outputs"],
               ios: [],
               dynamic_ios: nil
             } = NewTextOutput.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewTextOutput, %{
                 name: "test",
                 opts: %{
                   stream_timeout: 500,
                   jq_filter: "."
                 }
               })

      assert {:error, _} =
               Blocks.validate_block(NewTextOutput, %{})
    end

    test "broadcasts text" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewTextInput.create(%{
              name: "test_input",
              opts: %{},
              connections: []
            }),
            NewTextOutput.create(%{
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
      test_run |> BlocksTestRunner.Run.input("test_input", :input, Message.new(:raw, text))

      assert_receive {^topic, :start_stream, nil, _}

      assert_receive %Message{
        type: :raw,
        message: ^text,
        topic: ^topic,
        metadata: %{}
      }

      assert_receive {^topic, :stop_stream, nil, _}
    end
  end
end
