defmodule Buildel.Blocks.NewTextOutputTest do
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
                   output_as: "String",
                   jq_filter: "."
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewTextOutput, %{})
    end
  end

  describe "TextOutput Run" do
    setup [:create_run]

    test "outputs text", %{run: test_run} do
      message = Message.new(:text, "text")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message("test", :output, message)
      |> assert_receive_message("test", :forward, message)
    end

    test "uses jq filter", %{run: test_run} do
      message = Message.new(:json, %{content: "hello"})

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_jq")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
        "test_jq",
        :output,
        Message.new(:text, ~s({"content2":"hello"}))
      )
      |> assert_receive_message(
        "test_jq",
        :forward,
        Message.new(:text, ~s({"content2":"hello"}))
      )
    end

    test "sends error when trying to apply filter with text", %{run: test_run} do
      message = Message.new(:text, ~s({ "content": "hello" }))

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_jq")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_error(
        "test_jq",
        "Did not apply filter because message is a String not a JSON."
      )
      |> assert_receive_message("test_jq", :output, message)
      |> assert_receive_message("test_jq", :forward, message)
    end

    test "sends error with invalid jq filter with json", %{run: test_run} do
      message = Message.new(:json, %{content: "hello"})

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_jq_error")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_error(
        "test_jq_error",
        :failed_to_parse_message
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewTextOutput.create(%{
              name: "test",
              opts: %{},
              connections: [
                BlocksTestRunner.test_text_input_connection(:input)
              ]
            }),
            NewTextOutput.create(%{
              name: "test_jq",
              opts: %{
                jq_filter: "{content2: .content}",
                output_as: "JSON"
              },
              connections: [
                BlocksTestRunner.test_text_input_connection(:input)
              ]
            }),
            NewTextOutput.create(%{
              name: "test_jq_error",
              opts: %{
                jq_filter: "error",
                output_as: "JSON"
              },
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
