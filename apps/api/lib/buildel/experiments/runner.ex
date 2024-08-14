defmodule Buildel.Experiments.Runner do
  alias Buildel.Pipelines
  alias Buildel.Experiments.Runs.Run
  alias Buildel.Experiments.Runs.RunRowRun
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Experiments.Runner.Worker

  use GenServer

  def start_link(opts) do
    GenServer.start_link(__MODULE__, :ok, opts)
  end

  def poolboy_config do
    [
      name: {:local, :worker},
      worker_module: Buildel.Experiments.Runner.Worker,
      size: 50,
      max_overflow: 2
    ]
  end

  def run(experiment_run, data, pipeline) when is_list(data) do
    GenServer.call(__MODULE__, {:run, experiment_run, data, pipeline})
  end

  def run(experiment_run, {row, run, run_row_run}, pipeline) do
    run(experiment_run, [{row, run, run_row_run}], pipeline)
  end

  @impl true
  def init(_) do
    {:ok, %{tasks: %{}}}
  end

  @impl true
  def handle_call({:run, _experiment_run, [], _pipeline}, _from, state), do: {:reply, :ok, state}

  @impl true
  def handle_call({:run, experiment_run, data, pipeline}, _from, state) do
    public_outputs = Pipeline.ios(pipeline, public: true).outputs

    tasks =
      data
      |> Enum.map(fn {row, run, run_row_run} ->
        task =
          Task.Supervisor.async_nolink(Buildel.TaskSupervisor, fn ->
            Worker.run({row, run, run_row_run}, public_outputs)
          end)

        {task.ref, experiment_run.id}
      end)
      |> Map.new()

    state = update_in(state.tasks, &Map.merge(&1, tasks))

    {:reply, :ok, state}
  end

  @impl true
  def handle_info({ref, :ok}, state) do
    {experiment_run_id, state} = cleanup_task(state, ref)

    if(length(remaining_experiment_tasks(state.tasks, experiment_run_id)) == 0) do
      cleanup_experiment(experiment_run_id)
    end

    {:noreply, state}
  end

  def handle_info({:DOWN, ref, _, _, _reason}, state) do
    {experiment_run_id, state} = cleanup_task(state, ref)

    if(length(remaining_experiment_tasks(state.tasks, experiment_run_id)) == 0) do
      cleanup_experiment(experiment_run_id)
    end

    {:noreply, state}
  end

  defp remaining_experiment_tasks(tasks, experiment_run_id),
    do: Enum.filter(tasks, fn {_, eri} -> eri == experiment_run_id end)

  defp cleanup_task(state, ref) do
    Process.demonitor(ref, [:flush])

    pop_in(state.tasks[ref])
  end

  defp cleanup_experiment(experiment_run_id) do
    with {:ok, experiment_run} <- Buildel.Experiments.Runs.get_run(experiment_run_id),
         experiment_run_runs <- Buildel.Experiments.Runs.list_experiment_run_runs(experiment_run) do
      experiment_run_runs
      |> Enum.map(fn run_run ->
        run_run
        |> RunRowRun.finish(%{})

        Pipelines.get_run(run_run.run_id)
        |> Pipelines.Runner.stop_run()
      end)

      experiment_run
      |> Run.finish()
    end
  end

  defmodule Worker do
    alias Buildel.Experiments.Runs.RunRowRun
    alias Buildel.BlockPubSub
    alias Buildel.Pipelines
    use GenServer

    @wait_timeout 300_000
    @work_timeout 60_000

    def start_link(_) do
      GenServer.start_link(__MODULE__, nil)
    end

    def run({row, run, run_row_run}, public_outputs) do
      :poolboy.transaction(
        :worker,
        fn pid ->
          GenServer.call(
            pid,
            {:run, {row, run, run_row_run}, public_outputs},
            @work_timeout
          )
        end,
        @wait_timeout
      )
    end

    @impl true
    def init(_) do
      {:ok, nil}
    end

    @impl true
    def handle_call({:run, {row, run, run_row_run}, public_outputs}, _from, state) do
      {:ok, run} = Pipelines.Runner.start_run(run)
      context_id = Pipelines.Worker.context_id(run)

      outputs =
        public_outputs
        |> Enum.map(fn output ->
          topic =
            BlockPubSub.io_topic(
              context_id,
              output.block_name,
              output.output.name
            )

          BlockPubSub.subscribe_to_io(
            context_id,
            output.block_name,
            output.output.name
          )

          %{
            block_name: output.block_name,
            output_name: output.output.name,
            topic: topic,
            data: nil
          }
        end)

      row.data
      |> Enum.each(fn {block_name, data} ->
        BlockPubSub.broadcast_to_io(
          context_id,
          block_name,
          "input",
          {:text, data}
        )
      end)

      outputs =
        Enum.reduce_while(Stream.repeatedly(fn -> nil end), outputs, fn _, outputs ->
          outputs = receive_output(outputs)

          if Enum.any?(outputs, &(&1.data == nil)) do
            {:cont, outputs}
          else
            {:halt, outputs}
          end
        end)

      data =
        Map.merge(
          row.data,
          outputs
          |> Enum.reduce(%{}, fn output, acc ->
            output_data =
              case is_binary(output.data) do
                true -> output.data |> String.trim()
                false -> output.data
              end

            {_, evaluation} = calculate_evaluation(output_data)

            acc
            |> Map.put(output.block_name, evaluation)
          end)
        )

      {:ok, _run_row_run} =
        run_row_run
        |> RunRowRun.finish(data)

      run |> Pipelines.Runner.stop_run()

      {:reply, :ok, state}
    end

    @impl true
    def handle_info(_, state) do
      {:noreply, state}
    end

    defp receive_output([]), do: []

    defp receive_output(outputs) do
      topics = outputs |> Enum.map(& &1[:topic])

      receive do
        {topic, type, data, _metadata} when type != :start_stream and type != :stop_stream ->
          if topic in topics do
            outputs
            |> update_in(
              [
                Access.at(Enum.find_index(outputs, fn output -> output[:topic] == topic end)),
                :data
              ],
              fn _ -> data end
            )
          else
            outputs
          end

        _other ->
          outputs
      end
    end

    defp calculate_evaluation("true"), do: {:ok, 100}
    defp calculate_evaluation("false"), do: {:ok, 0}

    defp calculate_evaluation(number) when is_integer(number), do: {:ok, number}

    defp calculate_evaluation(number) when is_float(number), do: {:ok, number}

    defp calculate_evaluation(text) do
      with {int, ""} when int >= 0 and int <= 100 <- Integer.parse(text) do
        {:ok, int}
      else
        _ -> {:error, text}
      end
    end
  end
end
