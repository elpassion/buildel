defmodule Buildel.SqliteRepoManager do
  def start_dynamic_repo(name) do
    opts = %Buildel.DynamicRepoSqlite.Opts{
      database: :memory,
      temp_store: :memory,
      pool_size: 1,
      name: String.to_atom(name)
    }

    case Buildel.DynamicRepoSqlite.start_link(opts, "") do
      {:ok, pid} -> {:ok, pid}
      {:error, reason} -> {:error, reason}
    end
  end

  def generate_unique_name() do
    UUID.uuid4()
  end
end

defmodule Buildel.CSVSearch do
  @valid_name_regex ~r/^[a-zA-Z_][a-zA-Z0-9_]*$/

  def validate_name(name) when is_binary(name) do
    if Regex.match?(@valid_name_regex, name), do: name, else: raise("Invalid name: #{name}")
  end

  def handle_upload(repo_pid, file) do
    headers =
      file
      |> StringIO.open()
      |> case do
        {:ok, io_device} ->
          io_device
          |> IO.stream(:line)
          |> CSV.decode!(headers: true)
          |> Enum.at(0)
          |> Map.keys()

        {:error, reason} ->
          {:error, reason}
      end

    table_name = "table_#{:rand.uniform(1_000_000)}"

    # todo: normalize table column names

    validate_name(table_name)
    Enum.each(headers, &validate_name/1)

    create_table_sql = generate_create_table_sql(table_name, headers)

    Ecto.Adapters.SQL.query(repo_pid, create_table_sql)

    file
    |> StringIO.open()
    |> case do
      {:ok, io_device} ->
        io_device
        |> IO.stream(:line)
        |> CSV.decode!(headers: true)
        |> Enum.each(fn row ->
          {insert_sql, insert_parameters} = generate_insert_sql(repo_pid, table_name, row)
          Ecto.Adapters.SQL.query(repo_pid, insert_sql, insert_parameters)
        end)

      {:error, reason} ->
        {:error, reason}
    end

    {table_name, headers}
  end

  def execute_query(pid, query) do
    Ecto.Adapters.SQL.query(pid, query)
  end

  defp generate_create_table_sql(table_name, headers) do
    "CREATE TABLE #{table_name} (id INTEGER PRIMARY KEY AUTOINCREMENT, " <>
      Enum.map_join(headers, ", ", fn header ->
        "#{header} TEXT"
      end) <> ")"
  end

  defp generate_insert_sql(repo_pid, table_name, row) do
    columns = get_table_columns(repo_pid, table_name) |> Enum.join(", ")
    values = Map.values(row)

    escaped_parameters =
      values
      |> Enum.with_index()
      |> Enum.map_join(", ", fn {_value, index} ->
        "$#{index + 1}"
      end)

    sql = "INSERT INTO #{table_name} (#{columns}) VALUES (" <> escaped_parameters <> ")"

    {sql, values}
  end

  defp get_table_columns(repo_pid, table_name) do
    case Ecto.Adapters.SQL.query(repo_pid, "PRAGMA table_info(#{table_name})") do
      {:ok, result} ->
        [_id | columns] = Enum.map(Map.get(result, :rows), &Enum.at(&1, 1))
        columns

      _ ->
        []
    end
  end

  defmodule SQLFilter do
    @keywords [
      ~r/\bINSERT\b/i,
      ~r/\bUPDATE\b/i,
      ~r/\bDELETE\b/i,
      ~r/\bMERGE\b/i,
      ~r/\bREPLACE\b/i,
      ~r/\bCALL\b/i,
      ~r/\bLOCK\b/i,
      ~r/\bCREATE\b/i,
      ~r/\bALTER\b/i,
      ~r/\bDROP\b/i,
      ~r/\bTRUNCATE\b/i,
      ~r/\bCOMMENT\b/i,
      ~r/\bRENAME\b/i,
      ~r/\bGRANT\b/i,
      ~r/\bREVOKE\b/i,
      ~r/\bCOMMIT\b/i,
      ~r/\bROLLBACK\b/i,
      ~r/\bSAVEPOINT\b/i,
      ~r/\bSET\s+TRANSACTION\b/i,
      ~r/\bEXPLAIN\b/i,
      ~r/\bDESCRIBE\b/i,
      ~r/\bSHOW\b/i,
      ~r/\bUSE\b/i,
      ~r/\bEXECUTE\b/i,
      ~r/\bEXEC\b/i,
      ~r/\bUNION\b/i,
      ~r/\bINTERSECT\b/i,
      ~r/\bMINUS\b/i,
      ~r/\bWAITFOR\b/i,
      ~r/\bDECLARE\b/i,
      ~r/\bBULK\b/i,
      ~r/\bFETCH\b/i,
      ~r/\bOPEN\b/i,
      ~r/\bCLOSE\b/i,
      ~r/\bDISPOSE\b/i,
      ~r/\bSQLITE_MASTER\b/i,
      ~r/\bINFORMATION_SCHEMA\b/i,
      ~r/\bDUAL\b/i
    ]

    def is_safe_sql(query) do
      query = String.upcase(query)

      case Enum.any?(@keywords, fn keyword -> Regex.match?(keyword, query) end) do
        true -> :error
        false -> :ok
      end
    end
  end
end
