defmodule Buildel.Blocks.FileInputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.FileInput

  describe "TextInput" do
    test "exposes options" do
      assert FileInput.options() == %{
               type: "file_input",
               description:
                 "A streamlined module designed for the efficient handling and transmission of file data.",
               groups: ["file", "inputs / outputs"],
               inputs: [Block.file_temporary_input("input", true)],
               outputs: [Block.file_output()],
               ios: [],
               schema: FileInput.schema()
             }
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(FileInput, %{"name" => "test", "opts" => %{}, "inputs" => []})

      assert {:error, _} = Blocks.validate_block(FileInput, %{})
    end

    test "broadcasts text" do
      {:ok, test_run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            FileInput.create(%{
              name: "test",
              opts: %{},
              connections: []
            })
          ]
        })

      {:ok, topic} = test_run |> BlocksTestRunner.Run.subscribe_to_output("test", "output")
      file = File.read!("test/support/fixtures/real.mp3")
      test_run |> BlocksTestRunner.Run.input("test", "input", {:binary, file})

      assert_receive {^topic, :start_stream, nil, _}
      assert_receive {^topic, :binary, ^file, _}
      assert_receive {^topic, :stop_stream, nil, _}
    end
  end
end
