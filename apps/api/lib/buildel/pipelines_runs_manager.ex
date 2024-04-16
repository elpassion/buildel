defmodule Buildel.Pipelines.PipelineRunManager do
  alias Buildel.Repo
  alias Buildel.Pipelines.Pipeline
  alias Buildel.Pipelines.Run
  import Ecto.Query

  defmodule Params do
    defstruct [:page, :per_page, start_date: nil, end_date: nil]

    def from_map(params) do
      %__MODULE__{}
      |> struct(params)
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

  def list_pipeline_runs(%Pipeline{} = pipeline, params) do
    params = Params.from_map(params)

    query = build_query(pipeline.id, params.start_date, params.end_date)

    results = fetch_runs(query, params.page, params.per_page)
    count = count_runs(query)

    {:ok, results, count}
  end

  defp build_query(pipeline_id, start_date, end_date) do
    from(r in Run,
      where: r.pipeline_id == ^pipeline_id,
      where: r.inserted_at >= ^start_date and r.inserted_at <= ^end_date,
      order_by: [desc: r.id]
    )
  end

  defp fetch_runs(query, page, per_page) do
    offset = page * per_page

    query
    |> limit(^per_page)
    |> offset(^offset)
    |> Repo.all()
    |> Repo.preload(run_costs: :cost)
  end

  defp count_runs(query) do
    query
    |> exclude(:limit)
    |> exclude(:offset)
    |> Repo.aggregate(:count, :id)
  end
end
