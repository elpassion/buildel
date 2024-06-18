# defmodule Buildel.NewBlocks.Block do
#   defmacro __using__(_opts) do
#     quote do
#       use GenServer

#       def handle_info({topic, message_type, payload, metadata}, state) do
#         Task.start(fn ->
#           inputs_subscribed_to_topic(state.connections, topic)
#           |> Enum.map(fn input ->
#             {:input, input.name, {:text, text, metadata}}
#           end)
#           |> Stream.flat_map(fn {:input, name, input} ->
#             output = handle_input(name, input)

#             case Enumerable.impl_for(output) do
#               nil -> List.wrap(output)
#               _ -> output
#             end
#           end)
#           |> Stream.each(fn {:output, output_name, {type, payload, metadata}} ->
#             IO.puts("test")

#             # Buildel.BlockPubSub.broadcast_to_io(
#             #   state.block.context.context_id,
#             #   state.block.name,
#             #   output_name,
#             #   {type, payload},
#             #   metadata
#             # )
#           end)
#           |> Stream.run()
#         end)

#         {:noreply, state}
#       end

#       defp inputs_subscribed_to_topic(connections, topic) do
#         %{block: block, io: output_name} = BlockPubSub.io_from_topic(topic)

#         connections
#         |> Enum.filter(fn connection ->
#           connection.from.block_name == block && connection.from.name == output_name
#         end)
#         |> Enum.map(& &1.to)
#       end
#     end
#   end
# end
