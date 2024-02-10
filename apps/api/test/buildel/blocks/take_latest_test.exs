defmodule Buildel.Blocks.TakeLatestTest do
  use Buildel.BlockCase
  alias Blocks.TakeLatest

  test "exposes options" do
    assert TakeLatest.options() == %{
             description:
               "This module specializes in aggregating the latest inputs and combining them based on a specified template.",
             type: "take_latest",
             inputs: [Block.text_input("input")],
             outputs: [Block.text_output("output")],
             schema: TakeLatest.schema(),
             groups: ["text", "utils"],
             ios: []
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(TakeLatest, %{
               "name" => "test",
               "opts" => %{
                 "template" => "{{text_output:output}}",
                 "reset" => false
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(TakeLatest, %{})
  end

  test "outputs value when pushed to if template does not have any input used" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          TakeLatest.create(%{
            name: "test",
            opts: %{
              template: "dupa",
              reset: false
            },
            connections: [
              Blocks.Connection.from_connection_string("text_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    test_run
    |> BlocksTestRunner.Run.input(
      "text_input",
      "input",
      {:text, "Hello darkness my old friend."}
    )

    assert_receive({^topic, :start_stream, nil})
    assert_receive({^topic, :text, "dupa"})
    assert_receive({^topic, :stop_stream, nil})
  end

  test "outputs value inside template" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          TakeLatest.create(%{
            name: "test",
            opts: %{
              template: "dupa {{text_input:output}}",
              reset: false
            },
            connections: [
              Blocks.Connection.from_connection_string("text_input:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    test_run
    |> BlocksTestRunner.Run.input(
      "text_input",
      "input",
      {:text, "Hello darkness my old friend."}
    )

    assert_receive({^topic, :start_stream, nil})
    assert_receive({^topic, :text, "dupa Hello darkness my old friend."})
    assert_receive({^topic, :stop_stream, nil})
  end

  test "waits for all templates to be filled before emitting" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
          TakeLatest.create(%{
            name: "test",
            opts: %{
              template: "dupa {{text_input:output}} {{text_input_2:output}}"
            },
            connections: [
              Blocks.Connection.from_connection_string(
                "text_input:output->input?reset=false",
                "text"
              ),
              Blocks.Connection.from_connection_string(
                "text_input_2:output->input?reset=false",
                "text"
              )
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello"})
    assert_receive({^topic, :start_stream, nil})
    refute_received({^topic, :text, _message})
    refute_received({^topic, :stop_stream, nil})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World"})
    assert_receive({^topic, :text, "dupa Hello World"})
    assert_receive({^topic, :stop_stream, nil})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
    assert_receive({^topic, :text, "dupa Hello World 2"})
    assert_receive({^topic, :stop_stream, nil})
  end

  test "resets after emitting if reset is true" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
          TakeLatest.create(%{
            name: "test",
            opts: %{
              template: "dupa {{text_input:output}} {{text_input_2:output}}",
              reset: true
            },
            connections: [
              Blocks.Connection.from_connection_string("text_input:output->input", "text"),
              Blocks.Connection.from_connection_string("text_input_2:output->input", "text")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello"})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World"})
    assert_receive({^topic, :text, "dupa Hello World"})
    assert_receive({^topic, :stop_stream, nil})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
    refute_receive({^topic, :text, "dupa Hello World 2"})
    test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello 2"})
    assert_receive({^topic, :text, "dupa Hello 2 World 2"})
  end
end
