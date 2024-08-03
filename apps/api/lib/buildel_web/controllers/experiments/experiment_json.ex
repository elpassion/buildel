defmodule BuildelWeb.ExperimentJSON do
  alias Buildel.Experiments.Experiment

  def index(%{experiments: experiments}) do
    %{data: for(experiment <- experiments, do: data(experiment))}
  end

  def show(%{experiment: experiment}) do
    %{data: data(experiment)}
  end

  defp data(%Experiment{} = experiment) do
    %{
      id: experiment.id,
      name: experiment.name,
      runs_count: experiment.runs_count,
      pipeline_id: experiment.pipeline_id,
      dataset_id: experiment.dataset_id,
      created_at: experiment.inserted_at
    }
  end
end
