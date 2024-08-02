defmodule Buildel.Experiments.Runs do
  alias Buildel.Experiments
  alias Buildel.Experiments.Runs.RunRowRun
  alias Buildel.BlockPubSub
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Pipelines
  alias Buildel.Experiments.Experiment
  alias Buildel.Experiments.Runs.Run
  import Ecto.Query, warn: false
  alias Buildel.Repo

  def list_experiment_runs(%Experiment{} = experiment, pagination_params) do
    offset = pagination_params.page * pagination_params.per_page

    results =
      from(r in Run,
        where: r.experiment_id == ^experiment.id,
        order_by: [desc: r.inserted_at]
      )
      |> limit(^pagination_params.per_page)
      |> offset(^offset)
      |> Repo.all()

    {:ok, results, experiment.runs_count}
  end

  def list_experiment_run_runs(%Run{} = run, pagination_params) do
    offset = pagination_params.page * pagination_params.per_page

    results =
      from(rrr in RunRowRun,
        where: rrr.experiment_run_id == ^run.id,
        order_by: [desc: rrr.inserted_at]
      )
      |> limit(^pagination_params.per_page)
      |> offset(^offset)
      |> Repo.all()
      |> Repo.preload(:run)

    {:ok, results, run.runs_count}
  end

  def create_experiment_run(%Experiment{} = experiment, params \\ %{}) do
    case %Run{experiment_id: experiment.id}
         |> Run.changeset(params)
         |> Repo.insert() do
      {:ok, run} -> {:ok, run |> Repo.preload(experiment: [:dataset, :pipeline])}
      e -> e
    end
  end

  def get_experiment_run(%Experiment{} = experiment, id) do
    case from(r in Run, where: r.experiment_id == ^experiment.id and r.id == ^id) |> Repo.one() do
      nil -> {:error, :not_found}
      run -> {:ok, run |> Repo.preload(experiment: [:dataset, :pipeline])}
    end
  end

  def start_run(%Run{} = experiment_run) do
    with dataset_rows <-
           experiment_run.experiment.dataset |> Buildel.Datasets.Rows.list_dataset_rows(),
         %Pipeline{} = pipeline <- experiment_run.experiment.pipeline,
         {:ok, pipeline_config} <- Pipelines.get_pipeline_config(pipeline, "latest") do
      public_outputs =
        Map.get(pipeline_config, "blocks", [])
        |> Enum.map(fn block ->
          case Buildel.Blocks.type(block["type"]) do
            nil -> nil
            type -> Map.put(type.options(), :name, block["name"])
          end
        end)
        |> Enum.filter(fn
          nil -> false
          _ -> true
        end)
        |> Enum.flat_map(fn block ->
          block.outputs
          |> Enum.map(fn output ->
            %{
              block_name: block.name,
              output: output
            }
          end)
        end)
        |> Enum.filter(& &1.output.public)

      dataset_rows
      |> Enum.map(fn row ->
        Task.start(fn ->
          {:ok, run} =
            Buildel.Pipelines.create_run(%{
              pipeline_id: pipeline.id,
              config: pipeline_config |> Map.put(:metadata, %{})
            })

          {:ok, run_row_run} =
            create_run_row_run(%{
              experiment_run_id: experiment_run.id,
              run_id: run.id,
              dataset_row_id: row.id
            })

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
            Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, "input", {:text, data})
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
                acc
                |> Map.put(output.block_name, output.data)
              end)
            )

          {:ok, _run_row_run} =
            run_row_run
            |> RunRowRun.finish(data)

          run |> Pipelines.Runner.stop_run()
        end)

        :ok
      end)

      experiment_run |> Experiments.Runs.Run.start()
    end
  end

  def create_run_row_run(attrs) do
    %Buildel.Experiments.Runs.RunRowRun{}
    |> Buildel.Experiments.Runs.RunRowRun.changeset(attrs)
    |> Repo.insert()
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
end
