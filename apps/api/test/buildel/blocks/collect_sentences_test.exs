defmodule Buildel.Blocks.CollectSentencesTest do
  use Buildel.BlockCase, async: true
  alias Blocks.CollectSentences

  test "exposes options" do
    assert CollectSentences.options() == %{
             type: "collect_sentences",
             description:
               "This module segmenting and extracting individual sentences from continuous text streams.",
             inputs: [Block.text_input("input")],
             outputs: [Block.text_output("sentences_output")],
             schema: CollectSentences.schema(),
             groups: ["text", "utils"],
             ios: [],
             dynamic_ios: nil
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

  @tag :skip
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

    assert_receive({^sentences_topic, :start_stream, nil, _})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend.", _}, 1000)
    assert_receive({^sentences_topic, :stop_stream, nil, _})
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

    assert_receive({^sentences_topic, :start_stream, nil, _})
    refute_receive({^sentences_topic, :text, "Hello darkness my", _})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend.", _})
    assert_receive({^sentences_topic, :stop_stream, nil, _})
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
    refute_receive({^sentences_topic, :text, "Hello darkness my", _})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend.", _})
    assert_receive({^sentences_topic, :stop_stream, nil, _})
    assert_receive({^sentences_topic, :start_stream, nil, _})
    refute_receive({^sentences_topic, :text, "Hello darkness my old friend.", _})
    refute_receive({^sentences_topic, :text, "I've come to talk", _})
    assert_receive({^sentences_topic, :text, "I've come to talk with you again.", _})
    assert_receive({^sentences_topic, :stop_stream, nil, _})
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

    assert_receive({^sentences_topic, :start_stream, nil, _})
    assert_receive({^sentences_topic, :text, "Hello darkness my old friend.", _})
    assert_receive({^sentences_topic, :text, "I've come to talk with you again.", _})
    assert_receive({^sentences_topic, :stop_stream, nil, _})
  end
end
