defmodule Buildel.Pipelines.Worker do
  use Supervisor
  alias Buildel.Blocks
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Run

  # Client

  def start_link([%Run{} = run]) do
    result = Supervisor.start_link(__MODULE__, run, name: context_id(run) |> String.to_atom())

    context_id = context_id(run)

    Buildel.BlockPubSub.broadcast_started(context_id)
    result
  end

  def context_id(%Run{} = run) do
    organization_id =
      run |> Buildel.Repo.preload(:pipeline) |> Map.get(:pipeline) |> Map.get(:organization_id)

    "organizations:#{organization_id}:pipelines:#{run.pipeline_id}:runs:#{run.id}"
  end

  def context_from_context_id(context_id) do
    ["organizations", organization_id, "pipelines", pipeline_id, "runs", run_id] =
      String.split(context_id, ":")

    %{
      global: organization_id,
      parent: pipeline_id,
      local: run_id
    }
  end

  def block_id(%Run{} = run, %Blocks.Block{name: name}) do
    "#{context_id(run)}.#{name}"
  end

  def block_id(context_id, %{name: name}) do
    "#{context_id}.#{name}"
  end

  # Server

  @impl true
  def init(run) do
    Process.flag(:trap_exit, true)
    run |> Pipelines.start()

    blocks = Pipelines.blocks_for_run(run)

    context_id = context_id(run)

    children =
      for %Blocks.Block{type: type} = block <- blocks do
        block_id = block_id(run, block)

        context = %{
          block_id: block_id,
          context_id: context_id,
          context: context_from_context_id(context_id)
        }

        %{
          id: block_id |> String.to_atom(),
          start:
            {type, :start_link,
             [
               %{
                 block: block |> Buildel.Blocks.Block.set_context(context),
                 context: context
               }
             ]}
        }
      end

    Supervisor.init(children, strategy: :one_for_one)
  end
end
