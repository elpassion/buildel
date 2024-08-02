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

  def list_dataset_rows(%Dataset{} = dataset) do
    DatasetRow
    |> where([d], d.dataset_id == ^dataset.id)
    |> Repo.all()
  end

  def list_dataset_rows(%Dataset{} = dataset, %Params{} = params) do
    query = build_query(dataset.id, params)

    results = fetch_rows(query, params)
    count = count_rows(query)

    {:ok, results, count}
  end

  def create_row(%Dataset{} = dataset, attrs \\ %{}) do
    %DatasetRow{}
    |> DatasetRow.changeset(attrs |> Map.put(:dataset_id, dataset.id))
    |> Repo.insert()
  end

  def get_dataset_row(%Dataset{} = dataset, row_id) do
    DatasetRow
    |> where([r], r.dataset_id == ^dataset.id and r.id == ^row_id)
    |> Repo.one()
    |> then(fn
      nil -> {:error, :not_found}
      dataset_row -> dataset_row
    end)
  end

  def delete_row(%DatasetRow{} = dataset_row) do
    Repo.delete(dataset_row)
  end

  def update_row(%DatasetRow{} = dataset_row, attrs) do
    dataset_row
    |> DatasetRow.changeset(attrs)
    |> Repo.update()
  end

  defp build_query(dataset_id, %Params{}) do
    from(c in DatasetRow,
      where: c.dataset_id == ^dataset_id,
      order_by: [asc: c.id]
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
