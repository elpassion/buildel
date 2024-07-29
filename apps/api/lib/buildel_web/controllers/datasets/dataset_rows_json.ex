defmodule BuildelWeb.DatasetRowsJSON do
  alias Buildel.Datasets.DatasetRow

  def index(%{
        rows: rows,
        params: %Buildel.Datasets.Rows.Params{} = params,
        total: total
      }) do
    %{
      data: for(row <- rows, do: data(row)),
      meta: %{
        total: total,
        page: params.page,
        per_page: params.per_page
      }
    }
  end

  def show(%{row: row}) do
    %{data: data(row)}
  end

  defp data(%DatasetRow{} = row) do
    %{
      id: row.id,
      index: row.index,
      data: row.data,
      created_at: row.inserted_at
    }
  end
end
