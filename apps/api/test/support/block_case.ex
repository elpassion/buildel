defmodule Buildel.BlockCase do
  use ExUnit.CaseTemplate

  using do
    quote do
      use Buildel.DataCase

      alias Buildel.Blocks
      alias Buildel.BlockPubSub
      alias Buildel.BlocksTestRunner

      alias Blocks.{Block, Connection}
    end
  end
end
