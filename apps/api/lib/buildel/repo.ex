defmodule Buildel.Repo do
  use Ecto.Repo,
    otp_app: :buildel,
    adapter: Ecto.Adapters.Postgres

  use Paginator

  def disable_soft_deletion(tables_rules, fun) do
    transaction(fn ->
      for {table, rule} <- tables_rules do
        query!("ALTER TABLE #{quote_table(table)} DISABLE RULE #{rule}")
      end

      try do
        fun.()
      after
        for {table, rule} <- tables_rules do
          query!("ALTER TABLE #{quote_table(table)} ENABLE RULE #{rule}")
        end
      end
    end)
  end

  defp quote_table(name) when is_binary(name) do
    if String.contains?(name, "\"") do
      raise "invalid table name"
    end

    [?", name, ?"]
  end
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
