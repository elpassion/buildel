defmodule Buildel.Blocks.MapInputsTest do
  use Buildel.BlockCase, async: true
  alias Blocks.MapInputs

  test "exposes options" do
    assert MapInputs.options() == %{
             description:
               "Used to map the latest inputs and combine them based on a specified template.",
             type: "map_inputs",
             inputs: [Block.text_input("input")],
             outputs: [Block.text_output("output")],
             schema: MapInputs.schema(),
             groups: ["text", "utils"],
             ios: [],
             dynamic_ios: nil
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(MapInputs, %{
               "name" => "test",
               "opts" => %{
                 "template" => "{{text_output:output}}",
                 "reset" => false
               },
               "inputs" => []
             })

    assert {:error, _} = Blocks.validate_block(MapInputs, %{})
  end

  test "outputs value when pushed to if template does not have any input used" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          MapInputs.create(%{
            name: "test",
            opts: %{
              template: "\"dupa\"",
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

    assert_receive({^topic, :start_stream, nil, _})
    assert_receive({^topic, :text, "dupa\n", _}, 1000)
    assert_receive({^topic, :stop_stream, nil, _})
  end

  test "outputs value inside template" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          MapInputs.create(%{
            name: "test",
            opts: %{
              template: "\"dupa \\(.{{text_input:output}})\"",
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

    assert_receive({^topic, :start_stream, nil, _})
    assert_receive({^topic, :text, "dupa Hello darkness my old friend.\n", _}, 1000)
    assert_receive({^topic, :stop_stream, nil, _})
  end

  test "waits for all templates to be filled before emitting" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
          MapInputs.create(%{
            name: "test",
            opts: %{
              template: "\"dupa \\(.{{text_input:output}}) \\(.{{text_input_2:output}})\""
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
    assert_receive({^topic, :start_stream, nil, _})
    refute_received({^topic, :text, _message, _})
    refute_received({^topic, :stop_stream, nil, _})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World"})
    assert_receive({^topic, :text, "dupa Hello World\n", _}, 1000)
    assert_receive({^topic, :stop_stream, nil, _})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
    assert_receive({^topic, :text, "dupa Hello World 2\n", _}, 1000)
    assert_receive({^topic, :stop_stream, nil, _})
  end

  test "resets after emitting if reset is true" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
          Buildel.BlocksTestRunner.create_test_text_input_block("text_input_2"),
          MapInputs.create(%{
            name: "test",
            opts: %{
              template: "\"dupa \\(.{{text_input:output}}) \\(.{{text_input_2:output}})\"",
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
    assert_receive({^topic, :text, "dupa Hello World\n", _}, 1000)
    assert_receive({^topic, :stop_stream, nil, _})
    test_run |> BlocksTestRunner.Run.input("text_input_2", "input", {:text, "World 2"})
    refute_receive({^topic, :text, "dupa Hello World 2\n", _}, 1000)
    test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello 2"})
    assert_receive({^topic, :text, "dupa Hello 2 World 2\n", _}, 1000)
  end
end
