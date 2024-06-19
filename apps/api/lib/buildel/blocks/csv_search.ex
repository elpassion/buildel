defmodule Buildel.Blocks.CSVSearch do
  use Buildel.Blocks.Block
  use Buildel.Blocks.Tool

  # Config

  @impl true
  defdelegate cast(pid, chunk), to: __MODULE__, as: :query

  @impl true
  def options() do
    %{
      type: "csv_search",
      description: "Used for SQL searching and retrieval of information from CSV files",
      groups: ["file", "memory"],
      inputs: [
        Block.file_input("input", false),
        Block.text_input("query")
      ],
      outputs: [Block.text_output()],
      ios: [Block.io("tool", "worker")],
      schema: schema()
    }
  end

  @impl true
  def schema() do
    %{
      "type" => "object",
      "required" => ["name", "opts"],
      "properties" => %{
        "name" => name_schema(),
        "inputs" => inputs_schema(),
        "opts" =>
          options_schema(%{
            "required" => [],
            "properties" => %{}
          })
      }
    }
  end

  # Client

  def query(pid, {:text, _text} = text) do
    GenServer.cast(pid, {:query, text})
  end

  def query_sync(pid, {:text, _text} = text) do
    GenServer.call(pid, {:query, text})
  end

  def add_file(pid, file) do
    GenServer.cast(pid, {:add_file, file})
  end

  def delete_file(pid, file_id) do
    GenServer.cast(pid, {:delete_file, file_id})
  end

  # Server

  @impl true
  def setup(
        %{
          type: __MODULE__,
          opts: opts
        } = state
      ) do
    repo_name = Buildel.SqliteRepoManager.generate_unique_name()
    {:ok, repo_pid} = Buildel.SqliteRepoManager.start_dynamic_repo(repo_name)

    {:ok,
     state
     |> Map.put(:repo, {repo_name, repo_pid})
     |> Map.put(
       :call_formatter,
       opts |> Map.get(:call_formatter, "CSV 📑: Search \"{{config.args}}\"\n")
     )}
  end

  @impl true
  def tools(state) do
    table_names_string =
      case state[:table_names] do
        nil ->
          "No tables available"

        table_names ->
          table_names
          |> Enum.map(fn {table, columns, _file_id} -> "#{table}: #{Enum.join(columns, ", ")}" end)
          |> Enum.join("\n")
      end

    description =
      "Search the database using valid SQL query. If no tables are available - abort. \n\n ---------- \n\n Available tables and columns (all columns are type TEXT): \n\n #{table_names_string} \n\n YOU CAN USE ONLY THOSE TABLES. DO NOT USE ANY OTHER TABLES. DO *NOT* USE FILE_NAMES AS TABLE NAMES. \n\n ----------"

    [
      %{
        function: %{
          name: "query",
          description: description,
          parameters_schema: %{
            type: "object",
            properties: %{
              query: %{
                type: "string",
                description: "The query to search for."
              }
            },
            required: ["query"]
          }
        },
        call_formatter: fn args ->
          args = %{"config.args" => args, "config.block_name" => state.block.name}
          build_call_formatter(state.call_formatter, args)
        end,
        response_formatter: fn _response ->
          ""
        end
      }
    ]
  end

  def handle_input("input", {_topic, :binary, file_path, metadata}) do
    [
      {:start_stream, "output"},
      {:call,
       fn state ->
         file_id = Map.get(metadata, :file_id, UUID.uuid4())
         {_, repo_pid} = state[:repo]

         with :ok <- validate_file_type(Map.get(metadata, :file_type)),
              {:ok, file_content} <- File.read(file_path),
              {:ok, {table_name, headers}} <-
                Buildel.CSVSearch.handle_upload(repo_pid, file_content) do
           state =
             Map.update(state, :table_names, [{table_name, headers, file_id}], fn table_names ->
               [{table_name, headers} | table_names]
             end)

           {nil, state}
         else
           {:error, message} ->
             {{:error, message}, state}

           _ ->
             {{:error, "Unknown error"}, state}
         end
       end},
      {:stop_stream, "output"}
    ]
  end

  def handle_input("input", {_topic, :text, file_id, %{method: :delete}}) do
    [
      {:start_stream, "output"},
      {:call,
       fn state ->
         table_name =
           state[:table_names]
           |> Enum.find(fn {_, _, id} -> id == file_id end)
           |> elem(0)

         {_, repo_pid} = state[:repo]

         with :ok <- Buildel.CSVSearch.handle_delete(repo_pid, table_name) do
           state =
             Map.update(state, :table_names, [], fn table_names ->
               Enum.reject(table_names, fn {_, _, id} -> id == file_id end)
             end)

           {nil, state}
         else
           {:error, message} ->
             {{:error, message}, state}

           _ ->
             {{:error, "Unknown error"}, state}
         end
       end},
      {:stop_stream, "output"}
    ]
  end

  def handle_input("query", {_topic, :text, query, _metadata}) do
    [
      {:start_stream, "output"},
      {:cast,
       fn get_state ->
         state = get_state.()

         {_, repo_pid} = state[:repo]

         with :ok <- Buildel.CSVSearch.SQLFilter.is_safe_sql(query),
              {:ok, %Exqlite.Result{} = response} <-
                Buildel.CSVSearch.execute_query(repo_pid, query) do
           response = %{rows: response.rows, columns: response.columns}

           response = Jason.encode!(response)

           [{:output, "output", {:text, response, %{}}}]
         else
           :error ->
             {:error, "Invalid SQL query"}

           {:error, %Exqlite.Error{} = error} ->
             {:error, error.message}

           _ ->
             {:error, "Unknown error"}
         end
       end},
      {:stop_stream, "output"}
    ]
  end

  @impl true
  def handle_tool("tool", "query", {_name, :text, args, _}, state) do
    query(self(), {:text, args["query"]})
    state
  end

  defp build_call_formatter(value, args) do
    args
    |> Enum.reduce(value, fn
      {key, value}, acc when is_number(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_binary(value) ->
        String.replace(acc, "{{#{key}}}", value |> to_string() |> URI.encode())

      {key, value}, acc when is_map(value) ->
        String.replace(acc, "{{#{key}}}", Jason.encode!(value))

      _, acc ->
        acc
    end)
  end

  defp validate_file_type(file_type) do
    case file_type do
      nil -> :ok
      "text/csv" -> :ok
      type -> {:error, "Invalid file type #{type}. Only text/csv is allowed."}
    end
  end
end
