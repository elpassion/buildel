defmodule Buildel.RunLogs do
  import Ecto.Query, warn: false
  alias Buildel.Pipelines.AggregatedLog
  alias Buildel.Repo

  def list_run_logs(run) do
    run_id = run.id

    from(l in AggregatedLog,
      where: l.run_id == ^run_id,
      order_by: [desc: l.inserted_at],
      limit: 5
    )
    |> Repo.all()
  end
end
