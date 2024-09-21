defmodule Buildel.BlockCase do
  alias Buildel.Blocks.Utils.Message
  alias Buildel.BlocksTestRunner.Run
  use ExUnit.CaseTemplate

  using do
    quote do
      use Buildel.DataCase

      alias Buildel.Blocks
      alias Buildel.BlockPubSub
      alias Buildel.BlocksTestRunner
      alias Buildel.Blocks.Utils.Message

      alias Blocks.{Block, Connection}

      def assert_receive_message(%Run{} = run, block_name, output_name, message, options \\ []) do
        topic = run.subscriptions["#{block_name}_#{output_name |> to_string()}"]
        assert_receive_message(topic, message, options)
        run
      end

      def assert_receive_message(topic, %Message{} = message, options \\ []) do
        options = Keyword.validate!(options, start_stream: :receive, stop_stream: :receive)

        message = message |> Message.set_topic(topic)

        if options[:start_stream] == :receive, do: assert_receive({^topic, :start_stream, nil, _})

        message_topic = message.topic
        message_type = message.type
        message_message = message.message
        message_parents = message.parents
        message_metadata = message.metadata

        assert_receive %Message{
          topic: ^message_topic,
          type: message_type,
          message: message_message,
          parents: [message_parents | _],
          metadata: message_metadata
        }

        if options[:stop_stream] == :receive, do: assert_receive({^topic, :stop_stream, nil, _})
      end

      def assert_receive_error(%Run{} = run, block_name, error) do
        topic = run.subscriptions[block_name]
        assert_receive_error(topic, error)

        run
      end

      def assert_receive_error(topic, error) do
        assert_receive {^topic, :error, [^error], %{}}
      end
    end
  end
end
