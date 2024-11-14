defmodule Buildel.Blocks.NewDocumentSearchTest do
  alias Buildel.Blocks.NewFileInput
  use Buildel.BlockCase, async: true
  alias Blocks.NewDocumentSearch

  describe "DocumentSearch" do
    test "exposes options" do
      assert %{
               type: :document_search,
               description: "Used for efficient searching and retrieval of information from a collection of documents inside Buildel Knowledge Base.",
               groups: ["file", "memory"],
               inputs: [_, _, _],
               outputs: [_],
               ios: [_, _, _],
               dynamic_ios: nil
             } = NewDocumentSearch.options()
    end

#    test "validates schema correctly" do
#      assert :ok =
#               Blocks.validate_block(NewDocumentSearch, %{
#                 name: "test",
#                 opts: %{
#                   knowledge: "49",
#                   limit: 3,
#                   token_limit: 0,
#                   similarity_threshhold: 0.25,
#                   extend_neighbors: false,
#                   extend_parents: false,
#                   keywords: [],
#                   document_id: "",
#                   query: %{
#                     query_call_formatter: "ABC",
#                     query_response_formatter: "ABC"
#                   }
#                 }
#               })

#      assert {:error, _} = Blocks.validate_block(NewDocumentSearch, %{})
#    end
  end

  describe "DocumentSearch Run" do
    setup [:create_run]

    test "outputs content", %{run: test_run} do
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
      |> BlocksTestRunner.with_memory_returning(:create, fn _, _, _, _ -> {:ok, %{content: "FILE CONTENT"}} end)
      |> BlocksTestRunner.subscribe_to_block("test")
      |> BlocksTestRunner.test_input(message)
      |> assert_receive_message(
           "test",
           :output,
           message
           |> Message.from_message()
           |> Message.set_type(:text)
           |> Message.set_message("FILE CONTENT")
         )
    end

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
            NewDocumentSearch.create(%{
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


