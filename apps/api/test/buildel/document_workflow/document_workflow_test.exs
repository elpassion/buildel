defmodule Buildel.DocumentWorkflowTest do
  use ExUnit.Case, async: true
  alias Buildel.DocumentWorkflow
  alias Buildel.DocumentWorkflow.DocumentProcessor

  @file_params %{
    path: "/tmp/plug-1709-ujrO/multipart-1709542722-185255649821-7",
    file_metadata: %{type: "application/pdf"}
  }

  describe "read/1" do
    test "returns list of structs" do
      result =
        DocumentWorkflow.read({@file_params.path, @file_params.file_metadata})

      assert is_list(result)
      assert length(result) > 0
      assert is_map(Enum.at(result, 0))
      assert %DocumentProcessor.Paragraph{} = Enum.at(result, 0)
      assert %DocumentProcessor.Header{} = Enum.at(result, 1)
      assert %DocumentProcessor.ListItem{} = Enum.at(result, 2)
    end
  end

  describe "generate_keyword_nodes/1" do
    test "assings chunks to their keywords" do
      result =
        DocumentWorkflow.read({@file_params.path, @file_params.file_metadata})
        |> DocumentWorkflow.build_node_chunks()
        |> DocumentWorkflow.generate_keyword_nodes()

      assert %{
               "header1" => [_, _]
             } = result
    end
  end
end
