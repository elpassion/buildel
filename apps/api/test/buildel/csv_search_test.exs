defmodule Buildel.CSVSearchTest do
  use ExUnit.Case

  alias Buildel.CSVSearch

  setup [:create_sqlite_repo]

  @default_csv "id,First name\n1,John\n2,Paul\n3,George\n4,Ringo\n"

  describe "file processing" do
    test "returns error if not valid csv file passed", %{repo_pid: repo_pid} do
      assert {:error, _} = CSVSearch.handle_upload(repo_pid, "This is not a CSV file")
    end

    test "validates special characters in column names", %{repo_pid: repo_pid} do
      assert {:error, _} =
               CSVSearch.handle_upload(
                 repo_pid,
                 "id#,First name\n1,John\n2,Paul\n3,George\n4,Ringo\n"
               )
    end

    test "returns table and column names", %{repo_pid: repo_pid} do
      assert {:ok, {"table_" <> _, ["first_name", "id"]}} =
               CSVSearch.handle_upload(repo_pid, @default_csv)
    end

    test "creates a table based on the csv file headers", %{repo_pid: repo_pid} do
      {:ok, {table_name, _}} = CSVSearch.handle_upload(repo_pid, @default_csv)

      assert {:ok,
              %{
                columns: ["__buildel_temporary_id__", "first_name", "id"]
              }} = Ecto.Adapters.SQL.query(repo_pid, "SELECT * FROM #{table_name}")
    end

    test "inserts rows into the table", %{repo_pid: repo_pid} do
      {:ok, {table_name, _}} = CSVSearch.handle_upload(repo_pid, @default_csv)

      assert {:ok,
              %{
                rows: [
                  [1, "John", "1"],
                  [2, "Paul", "2"],
                  [3, "George", "3"],
                  [4, "Ringo", "4"]
                ]
              }} = Ecto.Adapters.SQL.query(repo_pid, "SELECT * FROM #{table_name}")
    end

    test "deletes specified table", %{repo_pid: repo_pid} do
      {:ok, {table_name, _}} = CSVSearch.handle_upload(repo_pid, @default_csv)

      assert :ok = CSVSearch.handle_delete(repo_pid, table_name)

      assert {:error, _} = Ecto.Adapters.SQL.query(repo_pid, "SELECT * FROM #{table_name}")
    end
  end

  describe "query" do
    test "executes SQL query", %{repo_pid: repo_pid} do
      {:ok, {table_name, _}} = CSVSearch.handle_upload(repo_pid, @default_csv)

      {:ok, %{columns: _, rows: rows}} =
        CSVSearch.execute_query(repo_pid, "SELECT * FROM #{table_name} WHERE id = 1")

      assert [[1, "John", "1"]] = rows
    end
  end

  defp create_sqlite_repo(_) do
    repo_name = Buildel.SqliteRepoManager.generate_unique_name()
    {:ok, repo_pid} = Buildel.SqliteRepoManager.start_dynamic_repo(repo_name)

    %{repo_pid: repo_pid, repo_name: repo_name}
  end
end
