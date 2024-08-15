defmodule Buildel.Experiments.Runs do
  alias Buildel.Experiments.Runs.RunRowRun
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

  def list_experiment_run_runs(%Run{} = run) do
    results =
      from(rrr in RunRowRun,
        where: rrr.experiment_run_id == ^run.id
      )
      |> Repo.all()

    results
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
      |> Repo.preload(dataset_row: [], run: [:pipeline])

    {:ok, results, run.runs_count}
  end

  def create_experiment_run(%Experiment{} = experiment) do
    pipeline_ios =
      experiment.pipeline
      |> Pipeline.ios(public: true)

    case %Run{experiment_id: experiment.id}
         |> Run.changeset(%{
           inputs: pipeline_ios.inputs |> Enum.map(& &1.block_name),
           outputs: pipeline_ios.outputs |> Enum.map(& &1.block_name)
         })
         |> Repo.insert() do
      {:ok, run} -> {:ok, run |> Repo.preload(experiment: [:dataset, :pipeline])}
      e -> e
    end
  end

  def get_run(id) do
    case from(r in Run, where: r.id == ^id) |> Repo.one() do
      nil -> {:error, :not_found}
      run -> {:ok, run |> Repo.preload(experiment: [:dataset, :pipeline])}
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
      multi = Ecto.Multi.new()

      multi =
        Ecto.Multi.one(multi, :experiment_run, fn _ ->
          from(er in Run, where: er.id == ^experiment_run.id)
        end)

      multi =
        Ecto.Multi.update(multi, :start_experiment_run, fn %{experiment_run: experiment_run} ->
          Run.update_status(experiment_run, :running)
        end)

      {experiment_run, operations} =
        dataset_rows
        |> Enum.reduce(multi, fn row, multi ->
          changeset =
            %Buildel.Pipelines.Run{}
            |> Buildel.Pipelines.Run.changeset(%{
              pipeline_id: pipeline.id,
              config: pipeline_config |> Map.put(:metadata, %{})
            })

          multi
          |> Ecto.Multi.insert({:insert_pipeline_run, row.id}, changeset)
          |> Ecto.Multi.insert({:insert_run_row_run, row.id}, fn %{experiment_run: experiment_run} =
                                                                   changes ->
            run = Map.get(changes, {:insert_pipeline_run, row.id})

            %Buildel.Experiments.Runs.RunRowRun{}
            |> Buildel.Experiments.Runs.RunRowRun.changeset(%{
              experiment_run_id: experiment_run.id,
              run_id: run.id,
              dataset_row_id: row.id
            })
          end)
        end)
        |> Buildel.Repo.transaction()
        |> then(fn {:ok, operations} ->
          operations = operations |> Map.delete(:experiment_run)

          {experiment_run, operations} =
            operations |> Map.pop(:start_experiment_run)

          operations =
            operations
            |> Enum.group_by(fn {{_name, id}, _value} -> id end)
            |> Enum.map(fn {id, changes} ->
              row = dataset_rows |> Enum.find(&(&1.id == id))

              {{_, _}, run} =
                changes
                |> Enum.find(fn {{name, _id}, _value} ->
                  name == :insert_pipeline_run
                end)

              {{_, _}, run_row_run} =
                changes
                |> Enum.find(fn {{name, _id}, _value} ->
                  name == :insert_run_row_run
                end)

              {row, run, run_row_run}
            end)

          {experiment_run, operations}
        end)

      Buildel.Experiments.Runner.run(experiment_run, operations, pipeline)
    end

    {:ok, experiment_run}
  end

  def create_run_row_run(attrs) do
    %Buildel.Experiments.Runs.RunRowRun{}
    |> Buildel.Experiments.Runs.RunRowRun.changeset(attrs)
    |> Repo.insert()
  end
end
