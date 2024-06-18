# defmodule Buildel.NewBlocks.TextInput do
#   def process_message({topic, :text, text, metadata}, state) do
#     Task.start(fn ->
#       [%{name: "input"}]
#       |> Enum.map(fn input ->
#         {:input, input.name, {:text, text, metadata}}
#       end)
#       |> Stream.flat_map(fn {:input, name, input} ->
#         output = handle_input(name, input)

#         case Enumerable.impl_for(output) do
#           nil -> List.wrap(output)
#           _ -> output
#         end
#       end)
#       |> Stream.each(fn
#         {:stream_start, output_name} ->
#           IO.puts("stream start")

#         {:stream_stop, output_name} ->
#           IO.puts("stream stop")

#         {:update, new_state} ->
#           update(state, new_state)

#         {:output, output_name, {type, payload, metadata}} ->
#           IO.puts("output")
#       end)
#       |> Stream.run()
#     end)
#   end

#   def handle_input("input", {:text, value, metadata}, state) do
#     output("output", {:text, value, metadata})
#   end

#   def handle_stream_stop("input", state) do
#     [
#       {:output, "output", {:text, state[:text], %{}}},
#       {:update, state |> Map.put(:text, "")},
#       {:stream_stop, "output"}
#     ]
#   end

#   defp output(output_name, {type, payload, metadata}) do
#     {:output, output_name, {type, payload, metadata}}
#   end

#   defp inputs_subscribed_to_topic(connections, topic) do
#     %{block: block, io: output_name} = BlockPubSub.io_from_topic(topic)

#     connections
#     |> Enum.filter(fn connection ->
#       connection.from.block_name == block && connection.from.name == output_name
#     end)
#     |> Enum.map(& &1.to)
#   end
# end
