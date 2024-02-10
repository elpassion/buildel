defmodule Buildel.BlocksTest do
  alias Buildel.Blocks
  alias Buildel.BlockPubSub
  alias Buildel.BlocksTestRunner
  use Buildel.DataCase

  alias Buildel.Blocks.{
    Block,
    CollectAllText
  }

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
