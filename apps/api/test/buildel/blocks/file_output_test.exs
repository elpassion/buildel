defmodule Buildel.Blocks.FileOutputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.FileOutput

  test "exposes options" do
    assert FileOutput.options() == %{
             type: "file_output",
             description:
               "A streamlined module designed for the efficient handling and transmission of file data.",
             groups: ["file", "inputs / outputs"],
             inputs: [Block.file_input()],
             outputs: [Block.file_output("output", true)],
             ios: [],
             schema: FileOutput.schema()
           }
  end

  test "broadcasts file" do
    {:ok, test_run} =
      BlocksTestRunner.start_run(%{
        blocks: [
          BlocksTestRunner.create_test_file_input_block("test_file_input"),
          FileOutput.create(%{
            name: "test",
            opts: %{},
            connections: [
              Blocks.Connection.from_connection_string("test_file_input:output->input", "file")
            ]
          })
        ]
      })

    {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")

    {:ok, path} = Temp.path(%{suffix: ".txt"})
    File.write!(path, "foo")

    file_id = UUID.uuid4()

    test_run
    |> BlocksTestRunner.Run.input("test_file_input", "input", {:binary, path}, %{
      file_id: file_id,
      file_name: "foo.txt",
      file_type: "text/plain"
    })

    assert_receive {^topic, :start_stream, nil, _}

    assert_receive {^topic, :binary, "foo",
                    %{
                      file_id: ^file_id,
                      file_name: "foo.txt",
                      file_type: "text/plain"
                    }}

    assert_receive {^topic, :stop_stream, nil, _}
  end
end
