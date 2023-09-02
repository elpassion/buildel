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

  def subscribe_to_io(context_id, block_output) do
    [block_name, io_name] = block_output |> String.split(":")

    output_name =
      case String.split(io_name, "->") do
        [output_name, _] -> output_name
        output_name -> output_name
      end

    subscribe("context:#{context_id}:block:#{block_name}:io:#{output_name}")
  end

  def io_from_topic(topic) do
    ["context", _context, "block", block, "io", output_name] = String.split(topic, ":")

    [block, output_name]
  end

  def unsubscribe_from_io(context_id, block_name, io_name) do
    unsubscribe(io_topic(context_id, block_name, io_name))
  end

  def unsubscribe_from_io(context_id, block_output) do
    unsubscribe("context:#{context_id}:#{block_output}")
  end

  def io_topic(context_id, block_name, io_name) do
    "context:#{context_id}:block:#{block_name}:io:#{io_name}"
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
    "context:#{context_id}:block:#{block_name}"
  end

  defp broadcast(topic, {message_type, content} = message) do
    # Logger.debug("Broadcasting to topic: #{topic}, message: #{inspect(message)}")

    Buildel.PubSub
    |> PubSub.broadcast!(topic, {topic, message_type, content})
  end

  defp subscribe(topic) do
    # Logger.debug("Subscribing to topic: #{topic}")
    Buildel.PubSub |> PubSub.subscribe(topic)
  end

  defp unsubscribe(topic) do
    # Logger.debug("Unsubscribing from topic: #{topic}")
    Buildel.PubSub |> PubSub.unsubscribe(topic)
  end
end
