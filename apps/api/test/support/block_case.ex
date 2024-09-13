defmodule Buildel.BlockCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use Buildel.DataCase

      alias Buildel.Blocks
      alias Buildel.BlockPubSub
      alias Buildel.BlocksTestRunner
      alias Buildel.Blocks.Utils.Message

      alias Blocks.{Block, Connection}
    end
  end
end
