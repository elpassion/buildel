defmodule Buildel.Blocks.NewFileToTextTest do
  alias Buildel.Blocks.NewFileInput
  use Buildel.BlockCase, async: true
  alias Blocks.NewFileToText

  describe "FileToText" do
    test "exposes options" do
      assert %{
               type: :file_to_text,
               description: "Used for reading a content of a file and outputting it as text.",
               groups: ["file", "inputs / outputs"],
               inputs: [_],
               outputs: [_],
               ios: [],
               dynamic_ios: nil
             } = NewFileToText.options()
    end

    test "validates schema correctly" do
      assert :ok =
               Blocks.validate_block(NewFileToText, %{
                 name: "test",
                 opts: %{}
               })

      assert {:error, _} = Blocks.validate_block(NewFileToText, %{})
    end
  end

  describe "FileToText Run" do
    setup [:create_run]

    test "outputs file text", %{run: test_run} do
      file = %{
        path: "test/support/fixtures/example.txt",
        file_id: UUID.uuid4(),
        file_name: "example.txt",
        file_type: "txt/plain"
      }

      message =
        Message.new(:file, file)

      test_run
      |> BlocksTestRunner.with_document_workflow_returning(:get_content, fn
        "test/support/fixtures/example.txt", ^file ->
          {:ok, "hello"}
      end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
        "test",
        :output,
        message
        |> Message.from_message()
        |> Message.set_type(:text)
        |> Message.set_message("hello")
      )
    end

    def create_run(_) do
      {:ok, run} =
        BlocksTestRunner.start_run(%{
          blocks: [
            NewFileInput.create(%{
              name: "test_input",
              opts: %{},
              connections: [
                BlocksTestRunner.test_file_input_connection(:input)
              ]
            }),
            NewFileToText.create(%{
              name: "test",
              opts: %{},
              connections: [
                Buildel.Blocks.Connection.from_connection_string(
                  "test_input:output->input",
                  "file"
                )
              ]
            })
          ]
        })

      %{run: run}
    end
  end
end
