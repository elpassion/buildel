defmodule Buildel.Blocks.Utils.Error do
  defmacro __using__(_opts) do
    quote do
      alias Buildel.BlockPubSub

      defp send_error(state, error_message) do
        BlockPubSub.broadcast_to_block(
          state[:context_id],
          state[:block_name],
          {:error, [error_message]}
        )

        state
      end
    end
  end
end
