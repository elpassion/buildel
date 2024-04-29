defmodule Buildel.Memories.MemoryCollectionCosts do
  alias Buildel.Memories.MemoryCollectionCost
  alias Buildel.Memories.MemoryCollection
  alias Buildel.Repo
  import Ecto.Query

  defmodule Params do
    @default_params %{
      page: 0,
      per_page: 10,
      start_date: nil,
      end_date: nil
    }

    defstruct [:page, :per_page, start_date: nil, end_date: nil]

    def from_map(params) do
      %__MODULE__{}
      |> struct(Map.merge(@default_params, params))
      |> set_default_dates()
    end

    defp set_default_dates(%__MODULE__{start_date: nil, end_date: nil} = params) do
      %{
        params
        | start_date:
            Date.utc_today() |> Date.beginning_of_month() |> NaiveDateTime.new!(~T[00:00:00]),
          end_date: NaiveDateTime.utc_now()
      }
    end

    defp set_default_dates(params), do: params
  end

  def list_collection_costs(%MemoryCollection{} = collection, %Params{} = params) do
    query = build_query(collection.id, params)

    results = fetch_costs(query, params)
    count = count_costs(query)

    {:ok, results, count}
  end

  defp build_query(collection_id, %Params{start_date: start_date, end_date: end_date}) do
    from(c in MemoryCollectionCost,
      where: c.memory_collection_id == ^collection_id,
      where: c.inserted_at >= ^start_date and c.inserted_at <= ^end_date,
      order_by: [desc: c.id]
    )
  end

  defp fetch_costs(query, %Params{page: page, per_page: per_page}) do
    offset = page * per_page

    query
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
    |> Repo.preload(:cost)
  end

  defp count_costs(query) do
    query
    |> Repo.aggregate(:count, :id)
  end
end
