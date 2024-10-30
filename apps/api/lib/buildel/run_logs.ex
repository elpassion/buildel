defmodule Buildel.RunLogs do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.AggregatedLog
  alias Buildel.Repo

  defmodule ListRunLogAttrs do
    defstruct [:block_name, :limit, :start_date, :end_date, :before, :after]

    def from_map(attrs) do
      default_attrs = %{
        block_name: nil,
        limit: 10,
        start_date: nil,
        end_date: nil,
        before: nil,
        after: nil
      }

      attrs =
        attrs
        |> Enum.reduce(default_attrs, fn
          {:start_date, date_str}, acc when is_binary(date_str) ->
            case NaiveDateTime.from_iso8601(date_str) do
              {:ok, dt} -> Map.put(acc, :start_date, dt)
              _error -> acc
            end

          {:end_date, date_str}, acc when is_binary(date_str) ->
            case NaiveDateTime.from_iso8601(date_str) do
              {:ok, dt} -> Map.put(acc, :end_date, dt)
              _error -> acc
            end

          {:per_page, per_page}, acc ->
            Map.put(acc, :limit, per_page)

          {key, value}, acc ->
            Map.put(acc, key, value)
        end)

      struct(__MODULE__, attrs)
    end
  end

  def list_run_logs(run, attrs \\ %{}) do
    attrs = ListRunLogAttrs.from_map(attrs)
    run_id = run.id

    base_query =
      from(l in AggregatedLog, where: l.run_id == ^run_id, order_by: [desc: l.inserted_at])

    query =
      Enum.reduce(Map.to_list(attrs), base_query, fn
        {:block_name, block_name}, query when is_binary(block_name) ->
          from(l in query, where: l.block_name == ^block_name)

        {:start_date, start_date}, query when is_struct(start_date, NaiveDateTime) ->
          from(l in query, where: l.inserted_at >= ^start_date)

        {:end_date, end_date}, query when is_struct(end_date, NaiveDateTime) ->
          from(l in query, where: l.inserted_at <= ^end_date)

        _, query ->
          query
      end)

    Repo.paginate(query,
      limit: attrs.limit,
      include_total_count: true,
      cursor_fields: [{:inserted_at, :desc}, {:id, :asc}],
      after: attrs.after
    )
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
