defmodule Buildel.Pipelines.Runner do
  use DynamicSupervisor
  require Logger
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Run

  def start_link(_args) do
    DynamicSupervisor.start_link(__MODULE__, %{}, name: __MODULE__)
  end

  def start_run(%Run{} = run, interface_config \\ %{}) do
    spec = {Buildel.Pipelines.Worker, [run]}

    with {:ok, _pid} <- DynamicSupervisor.start_child(__MODULE__, spec) do
      {:ok,
       run
       |> Buildel.Pipelines.Run.changeset(%{
         interface_config: interface_config
       })
       |> Buildel.Repo.update!()
       |> Buildel.Repo.reload()
       |> Buildel.Repo.preload(:pipeline)}
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

  def cast_run(%Run{} = run, block_name, input_name, data, metadata \\ %{}) do
    context_id = Buildel.Pipelines.Worker.context_id(run)
    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data, metadata)
    {:ok, run}
  end

  def create_chat_completion(%Run{} = run, params) do
    block_name = "chat_1"

    Buildel.Blocks.Block.call(block_pid(run, block_name), :chat_completion, params)
  end

  def create_chat_completion_stream(%Run{} = run, params) do
    block_name = "chat_1"

    Buildel.Blocks.Block.call(
      block_pid(run, block_name),
      :chat_completion,
      params |> Map.put(:stream_to, self())
    )
  end

  def block_pid(%Run{} = run, block_name) do
    Process.whereis(
      Buildel.Pipelines.Worker.block_id(run, %Buildel.Blocks.Block{name: block_name})
      |> String.to_atom()
    )
  end

  @impl true
  def init(_init) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end
end
