defmodule Buildel.BlockPubSub do
  require Logger
  alias Phoenix.PubSub

  def broadcast_to_io(context_id, block_name, io_name, message) do
    topic = io_topic(context_id, block_name, io_name)
    broadcast(topic, message)
  end

  def subscribe_to_io(context_id, block_name, io_name) do
    topic = io_topic(context_id, block_name, io_name)
    subscribe(topic)
    {:ok, topic}
  end

  def subscribe_to_io(context_id, %Buildel.Blocks.Connection{} = connection) do
    %{block_name: block_name, output: %{name: output_name}} = connection

    subscribe(io_topic(context_id, block_name, output_name))
  end

  def subscribe_to_io(context_id, connection_string) do
    %{block_name: block_name, output_name: output_name} =
      connection_description_from_connection_string(connection_string)

    subscribe(io_topic(context_id, block_name, output_name))
  end

  defp connection_description_from_connection_string(connection_string) do
    [block_name, io_name] = connection_string |> String.split(":")

    [output_name, input_name] =
      case String.split(io_name, "->") do
        [output_name, input_name] -> [output_name, input_name]
        [input_name] -> ["input", input_name]
      end

    %{
      block_name: block_name,
      output_name: output_name,
      input_name: input_name
    }
  end

  def io_from_topic(topic) do
    ["context", context, "block", block, "io", output_name] = String.split(topic, "::")

    %{
      context: context,
      block: block,
      io: output_name
    }
  end

  def unsubscribe_from_io(context_id, block_name, io_name) do
    unsubscribe(io_topic(context_id, block_name, io_name))
  end

  def unsubscribe_from_io(context_id, block_output) do
    unsubscribe(block_topic(context_id, block_output))
  end

  def broadcast_to_block(context_id, block_name, message) do
    topic = block_topic(context_id, block_name)
    broadcast(topic, message)
  end

  def subscribe_to_block(context_id, block_name) do
    topic = block_topic(context_id, block_name)
    subscribe(topic)
    {:ok, topic}
  end

  def unsubscribe_from_block(context_id, block_name) do
    unsubscribe(block_topic(context_id, block_name))
  end

  def block_topic(context_id, block_name) do
    "context::#{context_id}::block::#{block_name}"
  end

  def io_topic(context_id, block_name, io_name) do
    block_topic(context_id, block_name) <> "::io::#{io_name}"
  end

  defp broadcast(topic, {message_type, content} = message) do
    Logger.debug("Broadcasting to topic: #{topic}, message: #{inspect(message)}")

    Buildel.PubSub
    |> PubSub.broadcast!(topic, {topic, message_type, content})
  end

  defp subscribe(topic) do
    Logger.debug("Subscribing to topic: #{topic}")
    Buildel.PubSub |> PubSub.subscribe(topic)
  end

  defp unsubscribe(topic) do
    Logger.debug("Unsubscribing from topic: #{topic}")
    Buildel.PubSub |> PubSub.unsubscribe(topic)
  end
end
