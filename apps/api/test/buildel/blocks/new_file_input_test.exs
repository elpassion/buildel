defmodule Buildel.Blocks.NewFileInputTest do
  use Buildel.BlockCase, async: true
  alias Blocks.NewFileInput

  describe "FileInput" do
    test "exposes options" do
      assert %{
               type: :file_input,
               description:
                 "A streamlined module designed for the efficient handling and transmission of file data.",
               groups: ["file", "inputs / outputs"],
               inputs: [_],
               outputs: [_],
               ios: [],
               dynamic_ios: nil
             } = NewFileInput.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewFileInput, %{
                 name: "test",
                 opts: %{}
               })

      assert {:error, _} = Blocks.validate_block(NewFileInput, %{})
    end
  end

  describe "FileInput Run" do
    setup [:create_run]

    test "outputs file", %{run: test_run} do
      file = File.read!("test/support/fixtures/real.mp3")
      message = Message.new(:raw, file)

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.Run.input("test", :input, message)
      |> assert_receive_message("test", :output, message)
    end

    test "outputs delete file", %{run: test_run} do
      message = Message.new(:raw, "test123", %{method: :delete})

      test_run
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.Run.input("test", :input, message)
      |> assert_receive_message("test", :output, message)
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewFileInput.create(%{
              name: "test",
              opts: %{},
              connections: []
            })
          ]
        })

      %{run: run}
    end
  end
end
