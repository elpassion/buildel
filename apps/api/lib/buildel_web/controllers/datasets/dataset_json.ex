defmodule BuildelWeb.DatasetJSON do
  alias Buildel.Datasets.Dataset

  def index(%{datasets: datasets}) do
    %{data: for(dataset <- datasets, do: data(dataset))}
  end

  def show(%{dataset: dataset}) do
    %{data: data(dataset)}
  end

  defp data(%Dataset{} = dataset) do
    %{
      id: dataset.id,
      name: dataset.name,
      rows_count: dataset.rows_count,
      created_at: dataset.inserted_at
    }
  end
end
