defmodule Buildel.BlockPubSub do
  require Logger
  alias Phoenix.PubSub

  def broadcast_to_io(context_id, block_name, io_name, message, metadata \\ %{}) do
    topic = io_topic(context_id, block_name, io_name)
    broadcast(topic, message, metadata)
  end

  def subscribe_to_io(context_id, block_name, io_name) do
    topic = io_topic(context_id, block_name, io_name)
    subscribe(topic)
    {:ok, topic}
  end

  def subscribe_to_io(context_id, %Buildel.Blocks.Connection{} = connection) do
    %{from: %{name: output_name, block_name: block_name}} = connection

    subscribe(io_topic(context_id, block_name, output_name))
  end

  def io_from_topic(topic) do
    case topic |> String.split("::") do
      ["context", context_id, "block", block_name, "io", output_name] ->
        %{
          context: context_id,
          block: block_name,
          io: output_name
        }

      ["context", context_id, "block", block_name] ->
        %{
          context: context_id,
          block: block_name,
          io: nil
        }
    end
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

  def block_topic(context_id, block_name) do
    "context::#{context_id}::block::#{block_name}"
  end

  def io_topic(context_id, block_name, io_name) do
    block_topic(context_id, block_name) <> "::io::#{io_name}"
  end

  defp broadcast(topic, {message_type, content} = message, metadata \\ %{}) do
    Logger.debug(
      "Broadcasting to topic: #{topic}, message: #{inspect(message)}, metadata: #{inspect(metadata)})"
    )

    broadcast_date = NaiveDateTime.utc_now()

    case message_type do
      :workflow_started ->
        nil

      _ ->
        Buildel.PubSub
        |> PubSub.broadcast!(
          "buildel::logger",
          {topic, message_type, content, metadata, broadcast_date}
        )
    end

    metadata = Map.put(metadata, "_broadcast_date", broadcast_date)

    Buildel.PubSub
    |> PubSub.broadcast!(topic, {topic, message_type, content, metadata})
  end

  defp subscribe(topic) do
    Logger.debug("Subscribing to topic: #{topic}")
    Buildel.PubSub |> PubSub.subscribe(topic)
  end
end
