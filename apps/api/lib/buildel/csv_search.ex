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

  defp validate_name(name) when is_binary(name) do
    if Regex.match?(@valid_name_regex, name), do: :ok, else: {:error, "Invalid name: #{name}"}
  end

  defp validate_headers(headers) do
    Enum.reduce_while(headers, {:ok, []}, fn header, {:ok, acc} ->
      case validate_name(header) do
        :ok -> {:cont, {:ok, acc ++ [header]}}
        {:error, reason} -> {:halt, {:error, reason}}
      end
    end)
  end

  def handle_upload(repo_pid, file) do
    with {:ok, pid} <- StringIO.open(file) do
      process_file(repo_pid, pid)
    end
  end

  defp process_file(repo_pid, pid) do
    stream = IO.stream(pid, :line) |> CSV.decode(headers: true)

    case Enum.split_with(stream, &match?({:ok, _}, &1)) do
      {ok_results, []} when ok_results != [] ->
        rows = Enum.map(ok_results, fn {:ok, row} -> row end)
        headers = rows |> hd() |> Map.keys()
        content = rows |> Enum.map(&Map.values(&1))

        process_content(repo_pid, headers, content)

      {_, error_results} when error_results != [] ->
        {:error,
         "CSV decoding errors: #{Enum.map_join(error_results, ", ", fn {:error, reason} -> reason end)}"}

      {[], []} ->
        {:error, "CSV file is empty or has no valid rows"}
    end
  end

  defp process_content(repo_pid, headers, content) do
    headers =
      headers
      |> Enum.map(&String.downcase/1)
      |> Enum.map(&String.replace(&1, " ", "_"))

    table_name = generate_table_name()

    with {:ok, valid_headers} <- validate_headers(headers),
         :ok <- create_table(repo_pid, table_name, valid_headers),
         :ok <- insert_rows(repo_pid, table_name, content) do
      {:ok, {table_name, headers}}
    else
      {:error, reason} -> {:error, reason}
    end
  end

  defp generate_table_name do
    "table_#{:rand.uniform(1_000_000)}"
  end

  defp create_table(repo_pid, table_name, headers) do
    create_table_sql = generate_create_table_sql(table_name, headers)

    case Ecto.Adapters.SQL.query(repo_pid, create_table_sql) do
      {:ok, _result} -> :ok
      {:error, reason} -> {:error, "Failed to create table: #{reason}"}
    end
  end

  defp insert_rows(repo_pid, table_name, content) do
    Enum.each(content, fn row ->
      case generate_insert_sql(repo_pid, table_name, row) do
        {insert_sql, insert_parameters} ->
          case Ecto.Adapters.SQL.query(repo_pid, insert_sql, insert_parameters) do
            {:ok, _result} -> :ok
            {:error, reason} -> {:error, "Failed to insert row: #{reason}"}
          end
      end
    end)

    :ok
  end

  def execute_query(pid, query) do
    Ecto.Adapters.SQL.query(pid, query)
  end

  defp generate_create_table_sql(table_name, headers) do
    "CREATE TABLE #{table_name} (__buildel_temporary_id__ INTEGER PRIMARY KEY AUTOINCREMENT, " <>
      Enum.map_join(headers, ", ", fn header ->
        "#{header} TEXT"
      end) <> ")"
  end

  defp generate_insert_sql(repo_pid, table_name, row) do
    columns = get_table_columns(repo_pid, table_name) |> Enum.join(", ")

    escaped_parameters =
      row
      |> Enum.with_index()
      |> Enum.map_join(", ", fn {_value, index} ->
        "$#{index + 1}"
      end)

    sql = "INSERT INTO #{table_name} (#{columns}) VALUES (" <> escaped_parameters <> ")"

    {sql, row}
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
      # ~r/\bREPLACE\b/i,
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
