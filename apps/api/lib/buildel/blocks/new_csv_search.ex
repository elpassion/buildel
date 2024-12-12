defmodule Buildel.Blocks.NewCSVSearch do
  use Buildel.Blocks.NewBlock

  defblock(:csv_search,
    description: "Used for SQL searching and retrieval of information from CSV files",
    groups: ["tools", "file", "memory"]
  )

  definput(:input, schema: %{"type" => "object"}, type: :file)
  definput(:query, schema: %{})

  defoutput(:output, schema: %{})

  deftool(:query,
    description: "Search the database using valid SQL query",
    schema: %{
      type: "object",
      properties: %{
        query: %{
          type: "string",
          description: "The query to search for."
        }
      },
      required: ["query"]
    }
  )

  defp do_query(state, query) do
    with repo when not is_nil(repo) <- Map.get(state, :repo),
         {_, repo_pid} <- repo,
         :ok <- Buildel.CSVSearch.SQLFilter.is_safe_sql(query),
         {:ok, %Exqlite.Result{} = response} <- Buildel.CSVSearch.execute_query(repo_pid, query) do
      response = %{rows: response.rows, columns: response.columns}

      {:ok, Jason.encode!(response), state}
    else
      nil ->
        {:error, "Repo not initialized", state}

      :error ->
        {:error, "Invalid SQL query", state}

      {:error, %Exqlite.Error{} = error} ->
        {:error, error.message, state}

      _ ->
        {:error, "Unknown error", state}
    end
  end

  def handle_get_tool(:query, state) do
    tool = @tools |> Enum.find(&(&1.name == :query))

    table_names_string =
      case state[:table_names] do
        nil ->
          "No tables available"

        table_names ->
          table_names
          |> Enum.map(fn {table, columns, _file_id} ->
            "tableName: #{table} \n tableColumns: #{Enum.join(columns, ", ")}"
          end)
          |> Enum.join("\n\n")
      end

    description =
      "Search the database using valid SQL query. You can use only these available tables and columns (all columns are type TEXT): \n\n #{table_names_string} \n\n If no tables are available - abort!! \n If no tables match - abort!!"

    %{tool | description: description}
  end

  def handle_tool_call(:query, %Message{message: %{args: args}} = message, state) do
    send_stream_start(state, :output, message)

    case do_query(state, args["query"]) do
      {:ok, response, state} ->
        output(
          state,
          :output,
          Message.from_message(message)
          |> Message.set_message(response)
          |> Message.set_type(:text)
        )

        {:ok, response, state}

      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_message(reason)
          |> Message.set_type(:text)
        )

        send_stream_stop(state, :output, reason)

        {:error, reason, state}
    end
  end

  def handle_input(:query, %Message{message: query, type: :text} = message, state) do
    send_stream_start(state, :output, message)

    case do_query(state, query) do
      {:ok, response, state} ->
        output(
          state,
          :output,
          Message.from_message(message)
          |> Message.set_message(response)
          |> Message.set_type(:text)
        )

        {:ok, state}

      {:error, reason, state} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_message(reason)
          |> Message.set_type(:text)
        )

        send_stream_stop(state, :output, reason)

        {:error, reason, state}
    end
  end

  def handle_input(
        :input,
        %Message{metadata: %{method: :delete}, message: %{file_id: file_id}} = message,
        state
      ) do
    send_stream_start(state, :output, message)

    table_name =
      state[:table_names]
      |> Enum.find(fn {_, _, id} -> id == file_id end)
      |> elem(0)

    {state, {_, repo_pid}} = with_repo(state)

    with :ok <- Buildel.CSVSearch.handle_delete(repo_pid, table_name) do
      state =
        Map.update(state, :table_names, [], fn table_names ->
          Enum.reject(table_names, fn {_, _, id} -> id == file_id end)
        end)

      output(
        state,
        :output,
        Message.from_message(message)
        |> Message.set_message("")
        |> Message.set_type(:text)
      )

      {:ok, state}
    else
      {:error, reason} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, reason)

        {:error, reason, state}

      _ ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Unknown error")
        )

        send_stream_stop(state, :output, "Unknown error")

        {:error, "Unknown error", state}
    end
  end

  def handle_input(:input, %Message{message: file} = message, state) do
    send_stream_start(state, :output, message)

    file_id = Map.get(file, :file_id, UUID.uuid4())

    {state, {_repo_name, repo_pid}} = with_repo(state)

    with :ok <- validate_file_type(Map.get(file, :file_type)),
         {:ok, file_content} <- File.read(Map.get(file, :path)),
         {:ok, {table_name, headers}} <- Buildel.CSVSearch.handle_upload(repo_pid, file_content) do
      state =
        Map.update(state, :table_names, [{table_name, headers, file_id}], fn table_names ->
          [{table_name, headers, file_id} | table_names]
        end)

      output(
        state,
        :output,
        Message.from_message(message)
        |> Message.set_message(table_name)
        |> Message.set_type(:text)
      )

      {:ok, state}
    else
      {:error, reason} ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message(reason)
        )

        send_stream_stop(state, :output, reason)

        {:error, reason, state}

      _ ->
        send_error(
          state,
          Message.from_message(message)
          |> Message.set_type(:text)
          |> Message.set_message("Unknown error")
        )

        send_stream_stop(state, :output, "Unknown error")

        {:error, "Unknown error", state}
    end
  end

  defp validate_file_type(file_type) do
    case file_type do
      nil -> :ok
      "text/csv" -> :ok
      type -> {:error, "Invalid file type #{type}. Only text/csv is allowed."}
    end
  end

  defp with_repo(state) do
    case state[:repo] do
      nil ->
        repo_name = Buildel.SqliteRepoManager.generate_unique_name()
        {:ok, repo_pid} = Buildel.SqliteRepoManager.start_dynamic_repo(repo_name)
        state = state |> Map.put(:repo, {repo_name, repo_pid})

        {state, {repo_name, repo_pid}}

      repo ->
        {state, repo}
    end
  end
end
