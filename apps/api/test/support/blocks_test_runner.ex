defmodule Buildel.BlocksTestRunner do
  alias Buildel.BlocksTestRunner.Run
  alias Buildel.Blocks.Block

  use GenServer

  def start_run(config) do
    {:ok, pid} = GenServer.start_link(__MODULE__, config)

    {:ok, %Run{pid: pid}}
  end

  def block_id(block) do
    block.name
  end

  def context_id(pid) do
    "#{inspect(pid)}"
  end

  def context_from_context_id(context_id) do
    %{
      global: context_id,
      parent: context_id,
      local: context_id
    }
  end

  @impl true
  def init(config) do
    context_id = context_id(self())

    children =
      for %Block{type: type} = block <- config.blocks do
        block_id = block_id(block)

        %{
          id: block_id |> String.to_atom(),
          start:
            {type, :start_link,
             [
               %{
                 block: block,
                 context: %{
                   block_id: block_id,
                   context_id: context_id,
                   context: context_from_context_id(context_id)
                 }
               }
             ]}
        }
      end

    {:ok, _} = Supervisor.start_link(children, strategy: :one_for_one)

    {:ok, config}
  end
end
