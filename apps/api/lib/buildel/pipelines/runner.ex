defmodule Buildel.Pipelines.Runner do
  use DynamicSupervisor
  require Logger
  alias Buildel.Organizations
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Blocks.Utils.Message
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

  def build_complete_run(
        organization_id,
        pipeline_id,
        wait_for_outputs,
        initial_inputs
      ) do
    fn ->
      run =
        create_and_start_run(
          organization_id,
          pipeline_id,
          %{}
        )

      context_id = Buildel.Pipelines.Worker.context_id(run)

      outputs =
        wait_for_outputs
        |> Enum.map(fn %{block_name: block_name, output_name: output_name} ->
          {:ok, topic} = Buildel.BlockPubSub.subscribe_to_io(context_id, block_name, output_name)

          %{
            block_name: block_name,
            output_name: output_name,
            topic: topic,
            data: nil
          }
        end)

      initial_inputs
      |> Enum.map(fn %{input_name: input_name, block_name: block_name, message: message} ->
        Buildel.BlockPubSub.broadcast_to_io(
          Buildel.Pipelines.Worker.context_id(run),
          block_name,
          input_name,
          message
        )
      end)

      result =
        Enum.reduce_while(Stream.repeatedly(fn -> nil end), outputs, fn _, outputs ->
          outputs = receive_output(outputs)

          if Enum.any?(outputs, &(&1.data == nil)) do
            {:cont, outputs}
          else
            {:halt, outputs}
          end
        end)
        |> Enum.map(fn result -> {result.block_name, result.data} end)
        |> Enum.into(%{})

      run |> stop_run()

      result
    end
  end

  defp create_and_start_run(organization_id, pipeline_id, metadata) do
    with organization <- Organizations.get_organization!(organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, "latest"),
         {:ok, run} <-
           Pipelines.create_run(%{
             pipeline_id: pipeline_id,
             config: config |> Map.put(:metadata, metadata)
           }),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      run
    else
      e -> e
    end
  end

  defp receive_output([]), do: []

  defp receive_output(outputs) do
    topics = outputs |> Enum.map(& &1[:topic])

    receive do
      %Message{topic: topic, message: message} ->
        if topic in topics do
          outputs
          |> update_in(
            [
              Access.at(Enum.find_index(outputs, fn output -> output[:topic] == topic end)),
              :data
            ],
            fn _ -> message end
          )
        else
          outputs
        end

      _other ->
        outputs
    end
  end

  @impl true
  def init(_init) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end
end
