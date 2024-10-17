defmodule Buildel.Blocks.NewMapTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewMap

  describe "Map" do
    test "exposes options" do
      assert %{
               type: :map_inputs,
               description:
                 "Used to map the latest inputs and combine them based on a specified template.",
               inputs: [_],
               outputs: [_],
               groups: ["text", "utils"],
               ios: [],
               dynamic_ios: nil
             } = NewMap.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewMap, %{
                 name: "test",
                 opts: %{
                   template: "."
                 }
               })

      assert {:error, _} = Blocks.validate_block(NewMap, %{})
    end
  end

  describe "Map Run" do
    setup [:create_run]

    test "works with default template", %{run: test_run} do
      message = Message.new(:text, "test")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
        "test",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:json)
        |> Message.set_message(%{"TEST_INPUT:output" => "test"})
      )
    end

    test "waits for two inputs", %{run: test_run} do
      message = Message.new(:text, "test")

      test_run
      |> BlocksTestRunner.subscribe_to_block("test_multiple_inputs")
      |> BlocksTestRunner.test_input(message)
      |> BlocksTestRunner.test_input_2(message)
      |> assert_receive_message(
        "test_multiple_inputs",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:json)
        |> Message.set_message(%{"input_1" => "test", "input_2" => "test"})
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewMap.create(%{
              name: "test",
              opts: %{
                template: "."
              },
              connections: [
                BlocksTestRunner.test_text_input_connection(:input)
              ]
            }),
            NewMap.create(%{
              name: "test_multiple_inputs",
              opts: %{
                template: "{input_1: .{{TEST_INPUT:output}}, input_2: .{{TEST_INPUT_2:output}}}"
              },
              connections: [
                BlocksTestRunner.test_text_input_connection(:input),
                BlocksTestRunner.test_text_input_2_connection(:input)
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
