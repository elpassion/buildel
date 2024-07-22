defmodule Buildel.Blocks.CSVSearchTest do
  use Buildel.BlockCase, async: true
  alias Blocks.CSVSearch

  use ExVCR.Mock, adapter: ExVCR.Adapter.Hackney

  test "exposes options" do
    assert CSVSearch.options() == %{
             type: "csv_search",
             description: "Used for SQL searching and retrieval of information from CSV files",
             groups: ["file", "memory", "tools"],
             inputs: [
               Block.file_input("input", false),
               Block.text_input("query")
             ],
             outputs: [Block.text_output()],
             ios: [Block.io("tool", "worker")],
             schema: CSVSearch.schema()
           }
  end

  test "validates schema correctly" do
    assert :ok =
             Blocks.validate_block(CSVSearch, %{
               "name" => "test",
               "opts" => %{}
             })

    assert {:error, _} = Blocks.validate_block(CSVSearch, %{})
  end

  describe "csv file upload" do
    test "correctly parse and upload csv file" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_text_input"),
            BlocksTestRunner.create_test_file_input_block("test_file_input"),
            CSVSearch.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_text_input:output->query", "text"),
                Blocks.Connection.from_connection_string("test_file_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      {:ok, path} = Temp.path(%{suffix: ".txt"})
      File.write(path, "id, name\n1, John\n2, Jane\n3, Doe\n")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_file_input",
        "input",
        {:binary, path}
      )

      assert_receive({^text_topic, :start_stream, _, _}, 1000)
      assert_receive({^text_topic, :stop_stream, _, _}, 1000)
    end

    test "handle errors if incorrect file" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_text_input"),
            BlocksTestRunner.create_test_file_input_block("test_file_input"),
            CSVSearch.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_text_input:output->query", "text"),
                Blocks.Connection.from_connection_string("test_file_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, block_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_block("test")

      {:ok, path} = Temp.path(%{suffix: ".txt"})
      File.write(path, "invalid file")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_file_input",
        "input",
        {:binary, path}
      )

      assert_receive({^block_topic, :error, _, _}, 1000)
    end
  end

  describe "function" do
    test "passes generated table and column names to function description" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_text_input"),
            BlocksTestRunner.create_test_file_input_block("test_file_input"),
            CSVSearch.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_text_input:output->query", "text"),
                Blocks.Connection.from_connection_string("test_file_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      {:ok, path} = Temp.path(%{suffix: ".txt"})
      File.write(path, "id,very_unique_name\n1,John\n2,Jane\n3,Doe\n")

      [%{function: %{description: description}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      assert false == String.contains?(description, "very_unique_name")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_file_input",
        "input",
        {:binary, path}
      )

      assert_receive({^text_topic, :start_stream, _, _}, 1000)
      assert_receive({^text_topic, :stop_stream, _, _}, 1000)

      [%{function: %{description: description}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      assert String.contains?(description, "table_")
      assert String.contains?(description, "id, very_unique_name")
    end
  end

  describe "outputs" do
    test "outputs query result" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_text_input"),
            BlocksTestRunner.create_test_file_input_block("test_file_input"),
            CSVSearch.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_text_input:output->query", "text"),
                Blocks.Connection.from_connection_string("test_file_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

      {:ok, path} = Temp.path(%{suffix: ".txt"})
      File.write(path, "id, name\n1, John\n2, Jane\n3, Doe\n")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_file_input",
        "input",
        {:binary, path}
      )

      assert_receive({^text_topic, :start_stream, _, _}, 1000)
      assert_receive({^text_topic, :stop_stream, _, _}, 1000)

      [%{function: %{description: description}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      table_name = get_table_name_from_description(description)

      test_run
      |> BlocksTestRunner.Run.input(
        "test_text_input",
        "input",
        {:text, "SELECT * FROM #{table_name}"}
      )

      assert_receive(
        {^text_topic, :text,
         "{\"columns\":[\"__buildel_temporary_id__\",\"_name\",\"id\"],\"rows\":[[1,\" John\",\"1\"],[2,\" Jane\",\"2\"],[3,\" Doe\",\"3\"]]}",
         _},
        1000
      )
    end

    test "validates query for allowed keywords" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            BlocksTestRunner.create_test_text_input_block("test_text_input"),
            BlocksTestRunner.create_test_file_input_block("test_file_input"),
            CSVSearch.create(%{
              name: "test",
              opts: %{},
              connections: [
                Blocks.Connection.from_connection_string("test_text_input:output->query", "text"),
                Blocks.Connection.from_connection_string("test_file_input:output->input", "text")
              ]
            })
          ]
        })

      {:ok, text_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
      {:ok, block_topic} = test_run |> BlocksTestRunner.Run.subscribe_to_block("test")

      {:ok, path} = Temp.path(%{suffix: ".txt"})
      File.write(path, "id, name\n1, John\n2, Jane\n3, Doe\n")

      test_run
      |> BlocksTestRunner.Run.input(
        "test_file_input",
        "input",
        {:binary, path}
      )

      assert_receive({^text_topic, :start_stream, _, _}, 1000)
      assert_receive({^text_topic, :stop_stream, _, _}, 1000)

      [%{function: %{description: description}}] =
        test_run |> BlocksTestRunner.Run.get_tools("test")

      table_name = get_table_name_from_description(description)

      test_run
      |> BlocksTestRunner.Run.input(
        "test_text_input",
        "input",
        {:text, "DROP TABLE #{table_name}"}
      )

      assert_receive(
        {^block_topic, :error, ["Invalid SQL query"], _},
        1000
      )
    end
  end

  defp get_table_name_from_description(description) do
    Regex.scan(~r/table_[^:]+(?=:)/, description) |> List.first() |> List.first()
  end
end
