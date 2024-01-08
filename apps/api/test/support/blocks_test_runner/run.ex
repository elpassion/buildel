defmodule Buildel.BlocksTestRunner.Run do
  defstruct [:pid, :config]

  def subscribe_to_output(run, block, output_name) do
    Buildel.BlockPubSub.subscribe_to_io(
      Buildel.BlocksTestRunner.context_id(run.pid),
      block,
      output_name
    )
  end

  def input(run, block_name, input_name, data) do
    Buildel.BlockPubSub.broadcast_to_io(
      Buildel.BlocksTestRunner.context_id(run.pid),
      block_name,
      input_name,
      data
    )
  end
end
