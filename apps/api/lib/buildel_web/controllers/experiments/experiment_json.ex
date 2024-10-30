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
      pipeline: map_pipeline(experiment.pipeline),
      dataset: %{
        id: experiment.dataset.id,
        name: experiment.dataset.name
      },
      created_at: experiment.inserted_at
    }
  end

  defp map_pipeline(nil) do
    nil
  end

  defp map_pipeline(%{"id" => id, "name" => name}) do
    %{
      id: id,
      name: name
    }
  end

  defp map_pipeline(%{id: id, name: name}) do
    %{
      id: id,
      name: name
    }
  end
end
