defmodule Buildel.Datasets.Rows do
  alias Buildel.Datasets.Dataset
  alias Buildel.Datasets.DatasetRow
  alias Buildel.Repo
  import Ecto.Query

  defmodule Params do
    @default_params %{
      page: 0,
      per_page: 10
    }

    defstruct [:page, :per_page]

    def from_map(params) do
      %__MODULE__{}
      |> struct(Map.merge(@default_params, params))
    end
  end

  def list_dataset_rows(%Dataset{} = dataset, %Params{} = params) do
    query = build_query(dataset.id, params)

    results = fetch_rows(query, params)
    count = count_rows(query)

    {:ok, results, count}
  end

  defp build_query(dataset_id, %Params{}) do
    from(c in DatasetRow,
      where: c.dataset_id == ^dataset_id,
      order_by: [asc: c.index]
    )
  end

  defp fetch_rows(query, %Params{page: page, per_page: per_page}) do
    offset = page * per_page

    query
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
  end

  defp count_rows(query) do
    query
    |> Repo.aggregate(:count, :id)
  end
end
