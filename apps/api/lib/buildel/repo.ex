defmodule Buildel.Repo do
  use Ecto.Repo,
    otp_app: :buildel,
    adapter: Ecto.Adapters.Postgres

  use Paginator
end

defmodule Buildel.DynamicRepoSqlite do
  use Ecto.Repo,
    otp_app: :buildel,
    adapter: Ecto.Adapters.SQLite3

  defmodule Opts do
    defstruct [:database, :temp_store, :pool_size, :name]
  end

  def start_link(%Opts{} = opts, _) do
    Ecto.Repo.Supervisor.start_link(__MODULE__, :buildel, Ecto.Adapters.SQLite3,
      database: opts.database,
      temp_store: opts.temp_store,
      pool_size: opts.pool_size,
      name: opts.name
    )
  end
end
