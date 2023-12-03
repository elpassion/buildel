defmodule Buildel.Pipelines.Runner do
  use DynamicSupervisor
  require Logger
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Run

  def start_link(_args) do
    DynamicSupervisor.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def start_run(%Run{} = run) do
    spec = {Buildel.Pipelines.Worker, [run]}

    with {:ok, _pid} <- DynamicSupervisor.start_child(__MODULE__, spec) do
      {:ok, run |> Buildel.Repo.reload() |> Buildel.Repo.preload(:pipeline)}
    else
      {:error, {:already_started, _}} ->
        {:ok, run |> Buildel.Repo.reload() |> Buildel.Repo.preload(:pipeline)}

      {:error, reason} ->
        run |> Pipelines.finish()
        Logger.error("Failed to start worker with reason: #{inspect(reason)}")
        {:error, reason}
    end
  end

  def stop_run(%Run{} = run) do
    case Process.whereis(Buildel.Pipelines.Worker.context_id(run) |> String.to_atom()) do
      nil ->
        Logger.debug("No worker found for #{inspect(run)}")
        run |> Pipelines.finish()

      pid ->
        DynamicSupervisor.terminate_child(__MODULE__, pid)
        run |> Pipelines.finish()
    end
  end

  def get_run_blocks(%Run{} = run) do
    case Process.whereis(
           (context_id = Buildel.Pipelines.Worker.context_id(run))
           |> String.to_atom()
         ) do
      nil ->
        Logger.debug("No worker found for #{inspect(run)}")
        []

      pid ->
        Supervisor.which_children(pid)
        |> Enum.map(fn {_name, pid, _, [type]} ->
          %{
            pid: pid,
            type: type,
            name: type.name(pid),
            block_name: type.block_name(pid),
            context_id: context_id
          }
        end)
    end
  end

  def cast_run(%Run{} = run, block_name, input_name, data) do
    context_id = Buildel.Pipelines.Worker.context_id(run)
    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data)
    {:ok, run}
  end

  def call_run(%Run{} = run, block_name, data) do
    with _run_pid <-
           Process.whereis(Buildel.Pipelines.Worker.context_id(run) |> String.to_atom()),
         block_pid <-
           Process.whereis(
             Buildel.Pipelines.Worker.block_id(run, %Buildel.Blocks.Block{name: block_name})
             |> String.to_atom()
           ),
         type <- Buildel.Blocks.Block.type(block_pid) do
      type.cast(block_pid, data)
    end
  end

  @impl true
  def init(_init) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end
end
