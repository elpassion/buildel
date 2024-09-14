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
                   stream_timeout: 500,
                   jq_filter: "."
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewTextOutput, %{})
    end
  end

  describe "TextOutput Run" do
    setup [:create_run]

    test "validates input", %{run: test_run} do
      message = Message.new(:raw, %{})

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_text_input(message)
      |> assert_receive_error("test", :invalid_input)
    end

    test "outputs text", %{run: test_run} do
      message = Message.new(:raw, "text")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_text_input(message)
      |> assert_receive_message("test", :output, message)
      |> assert_receive_message("test", :forward, message)
    end

    test "uses jq filter", %{run: test_run} do
      message = Message.new(:raw, ~s({ "content": "hello" }))

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_jq")
      |> BlocksTestRunner.test_text_input(message)
      |> assert_receive_message("test_jq", :output, message |> Message.set_message("hello"))
      |> assert_receive_message("test_jq", :forward, message |> Message.set_message("hello"))
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
                jq_filter: ".content"
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
