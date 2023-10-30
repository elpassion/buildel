defmodule Buildel.Blocks.Utils.Error do
  defmacro __using__(_opts) do
    quote do
      alias Buildel.BlockPubSub

      defp send_error(state) do
        BlockPubSub.broadcast_to_block(
          state[:context_id],
          state[:block_name],
          {:error, nil}
        )

        state
      end
    end
  end
end
