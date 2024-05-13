defmodule Buildel.RunLogs do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.AggregatedLog
  alias Buildel.Repo

  @default_attrs %{
    block_name: nil,
    limit: 10,
    start_date: NaiveDateTime.utc_now() |> NaiveDateTime.add(-5, :minute),
    end_date: nil
  }

  def list_run_logs(run, attrs \\ %{}) do
    attrs = Map.merge(@default_attrs, attrs)
    run_id = run.id

    base_query =
      from(l in AggregatedLog, where: l.run_id == ^run_id, order_by: [desc: l.inserted_at])

    query =
      Enum.reduce(attrs, base_query, fn
        {:block_name, block_name}, query when is_binary(block_name) ->
          from l in query, where: l.block_name == ^block_name

        {:limit, limit}, query when is_integer(limit) ->
          from l in query, limit: ^limit

        {:start_date, start_date}, query when is_binary(start_date) ->
          from l in query, where: l.inserted_at >= ^start_date

        {:end_date, end_date}, query when is_binary(end_date) ->
          from l in query, where: l.inserted_at <= ^end_date

        _, query ->
          query
      end)

    query |> Repo.all()
  end

  def create_run_log(attrs \\ %{}) do
    case %AggregatedLog{}
         |> AggregatedLog.changeset(attrs)
         |> Repo.insert() do
      {:ok, struct} -> {:ok, struct |> Repo.preload(:run)}
      {:error, changeset} -> {:error, changeset}
    end
  end
end
