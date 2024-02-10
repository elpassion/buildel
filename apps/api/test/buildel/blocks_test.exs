defmodule Buildel.BlocksTest do
  alias Buildel.Blocks
  alias Buildel.BlockPubSub
  alias Buildel.BlocksTestRunner
  use Buildel.DataCase

  alias Buildel.Blocks.{
    Block,
    CollectSentences,
    CollectAllText,
    TakeLatest
  }

  describe "TakeLatest" do
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

  describe "CollectSentences" do
    test "exposes options" do
      assert CollectSentences.options() == %{
               type: "collect_sentences",
               description:
                 "This module segmenting and extracting individual sentences from continuous text streams.",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("sentences_output")],
               schema: CollectSentences.schema(),
               groups: ["text", "utils"],
               ios: []
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(CollectSentences, %{
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(CollectSentences, %{})
    end

    test "outputs full sentence" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            CollectSentences.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, sentences_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "sentences_output")

      test_run
      |> BlocksTestRunner.Run.input(
        "text_input",
        "input",
        {:text, "Hello darkness my old friend."}
      )

      assert_receive({^sentences_topic, :start_stream, nil})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    @tag :skip
    test "does not output not finished sentence" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            Buildel.BlocksTestRunner.create_test_text_input_block("text_input"),
            CollectSentences.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("text_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, sentences_topic} =
        test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "sentences_output")

      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, "Hello darkness my"})
      test_run |> BlocksTestRunner.Run.input("text_input", "input", {:text, " old friend."})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    @tag :skip
    test "works with 2 separate inputs" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.cast({:text, "Hello darkness my"})
      pid |> CollectSentences.cast({:text, " old friend."})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})
      pid |> CollectSentences.cast({:text, "I've come to talk"})
      pid |> CollectSentences.cast({:text, " with you again."})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :stop_stream, nil})
      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      refute_receive({^sentences_topic, :text, "I've come to talk"})
      assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end

    @tag :skip
    test "correctly splits single input with multiple sentences" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid
      |> CollectSentences.cast(
        {:text, "Hello darkness my old friend. I've come to talk with you again."}
      )

      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      assert_receive({^sentences_topic, :start_stream, nil})
      assert_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end
  end

  describe "CollectAllText" do
    test "exposes options" do
      assert CollectAllText.options() == %{
               type: "collect_all_text",
               description:
                 "This module specializes in accumulating and consolidating text input from streaming sources.",
               inputs: [Block.text_input("input")],
               outputs: [Block.text_output("output")],
               schema: CollectAllText.schema(),
               groups: ["text", "utils"],
               ios: []
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(CollectAllText, %{
                 "name" => "test",
                 "opts" => %{},
                 "inputs" => []
               })

      assert {:error, _} = Blocks.validate_block(CollectAllText, %{})
    end

    @tag :skip
    test "works with 2 separate inputs" do
      {:ok, pid} =
        CollectSentences.start_link(%{
          name: "test",
          block_name: "test",
          context_id: "run1",
          opts: %{},
          connections: [
            Blocks.Connection.from_connection_string("text_test:output->input", "text")
          ]
        })

      {:ok, sentences_topic} = BlockPubSub.subscribe_to_io("run1", "test", "sentences_output")

      pid |> CollectSentences.cast({:text, "Hello darkness my"})
      pid |> CollectSentences.cast({:text, " old friend."})
      pid |> CollectSentences.cast({:text, "Another sentence."})
      pid |> CollectSentences.cast({:text, "And another!"})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      pid |> CollectSentences.cast({:text, "I've come to talk"})
      pid |> CollectSentences.cast({:text, " with you again."})
      BlockPubSub.broadcast_to_io("run1", "text_test", "output", {:stop_stream, nil})

      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my"})

      assert_receive(
        {^sentences_topic, :text, "Hello darkness my old friend.Another sentence.And another!"}
      )

      assert_receive({^sentences_topic, :stop_stream, nil})
      assert_receive({^sentences_topic, :start_stream, nil})
      refute_receive({^sentences_topic, :text, "Hello darkness my old friend."})
      refute_receive({^sentences_topic, :text, "I've come to talk"})
      assert_receive({^sentences_topic, :text, "I've come to talk with you again."})
      assert_receive({^sentences_topic, :stop_stream, nil})
    end
  end
end
