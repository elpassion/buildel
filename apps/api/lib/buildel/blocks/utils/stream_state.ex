defmodule Buildel.Blocks.Utils.StreamState do
  defmacro __using__(_opts) do
    quote do
      alias Buildel.BlockPubSub

      defp assign_stream_state(state, opts \\ %{}) do
        state
        |> Map.put(:stream_state, :idle)
        |> Map.put(:stream_timer, nil)
        |> Map.put(:stream_timeout, Map.get(opts, :stream_timeout, stream_timeout()))
      end

      defp send_stream_start(state, output \\ "output") do
        # case state[:stream_state] do
        #   :idle ->
        #     state = put_in(state[:stream_state], :streaming)

        BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          output,
          {:start_stream, nil}
        )

        BlockPubSub.broadcast_to_block(
          state[:context_id],
          state[:block_name],
          {:start_stream, nil}
        )

        #   state

        # _ ->
        #   state
        # end
      end

      defp send_stream_stop(state, output \\ "output") do
        # case state[:stream_state] do
        #   :streaming ->
        #     state = put_in(state[:stream_state], :idle)

        BlockPubSub.broadcast_to_io(
          state[:context_id],
          state[:block_name],
          output,
          {:stop_stream, nil}
        )

        BlockPubSub.broadcast_to_block(
          state[:context_id],
          state[:block_name],
          {:stop_stream, nil}
        )

        #   state

        # _ ->
        #   state
        # end
      end

      defp schedule_stream_stop(state, output \\ "output") do
        if state[:stream_timer] && state[:stream_state] == :streaming do
          Process.cancel_timer(state[:stream_timer])
        end

        timeout = state |> Map.get(:stream_timeout, stream_timeout())

        timer = Process.send_after(self(), {:stop_stream, output}, timeout)
        put_in(state[:stream_timer], timer)
      end
    end
  end
end
