defmodule Buildel.DocumentProcessorTest do
  use ExUnit.Case
  alias Buildel.DocumentWorkflow.DocumentProcessor

  @document [
    %{
      "bbox" => [28.0, 86.93, 87.59, 95.83000000000001],
      "block_class" => "cls_0",
      "block_idx" => 0,
      "level" => 0,
      "page_idx" => 0,
      "sentences" => ["Para1"],
      "tag" => "para"
    },
    %{
      "bbox" => [28.0, 86.93, 87.59, 95.83000000000001],
      "block_class" => "cls_0",
      "block_idx" => 0,
      "level" => 0,
      "page_idx" => 0,
      "sentences" => ["Header1"],
      "tag" => "header"
    },
    %{
      "bbox" => [28.0, 86.93, 87.59, 95.83000000000001],
      "block_class" => "cls_0",
      "block_idx" => 0,
      "level" => 1,
      "page_idx" => 0,
      "sentences" => ["List1"],
      "tag" => "list_item"
    }
  ]

  describe "map_to_structures/1" do
    test "maps list to correct structures" do
      result = DocumentProcessor.map_to_structures(@document)

      assert [
               %DocumentProcessor.Paragraph{
                 id: _,
                 level: 0,
                 value: "Para1",
                 metadata: %{}
               },
               %DocumentProcessor.Header{
                 id: _,
                 level: 0,
                 value: "Header1",
                 metadata: %{}
               },
               %DocumentProcessor.ListItem{
                 id: _,
                 level: 1,
                 value: "List1",
                 metadata: %{}
               }
             ] = result
    end
  end

  describe "map_with_relations/1" do
    test "assigns correct relations" do
      result =
        DocumentProcessor.map_to_structures(@document)
        |> DocumentProcessor.map_with_relations()

      first_id = Map.get(Enum.at(result, 0), :id)
      second_id = Map.get(Enum.at(result, 1), :id)
      third_id = Map.get(Enum.at(result, 2), :id)

      assert [
               %DocumentProcessor.Paragraph{
                 id: _,
                 level: 0,
                 value: "Para1",
                 metadata: %{},
                 next: ^second_id,
                 previous: nil,
                 parent: nil
               },
               %DocumentProcessor.Header{
                 id: _,
                 level: 0,
                 value: "Header1",
                 metadata: %{},
                 next: ^third_id,
                 previous: ^first_id,
                 parent: nil
               },
               %DocumentProcessor.ListItem{
                 id: _,
                 level: 1,
                 value: "List1",
                 metadata: %{},
                 next: nil,
                 previous: ^second_id,
                 parent: ^second_id
               }
             ] = result
    end
  end

  @additional_document [
    %{
      "bbox" => [28.0, 86.93, 87.59, 95.83000000000001],
      "block_class" => "cls_0",
      "block_idx" => 0,
      "level" => 2,
      "page_idx" => 0,
      "sentences" => ["Header2"],
      "tag" => "header"
    },
    %{
      "bbox" => [28.0, 86.93, 87.59, 95.83000000000001],
      "block_class" => "cls_0",
      "block_idx" => 0,
      "level" => 3,
      "page_idx" => 0,
      "sentences" => ["Para"],
      "tag" => "para"
    }
  ]

  describe "map_with_headers_metadata/1" do
    test "adds additional headers property to metadata" do
      result =
        DocumentProcessor.map_to_structures(@document ++ @additional_document)
        |> DocumentProcessor.map_with_relations()
        |> DocumentProcessor.map_with_headers_metadata()

      assert [
               %DocumentProcessor.Paragraph{
                 id: _,
                 level: 0,
                 value: "Para1",
                 metadata: %{}
               },
               %DocumentProcessor.Header{
                 id: _,
                 level: 0,
                 value: "Header1",
                 metadata: %{}
               },
               %DocumentProcessor.ListItem{
                 id: _,
                 level: 1,
                 value: "List1",
                 metadata: %{
                   headers: ["Header1"]
                 }
               },
               %DocumentProcessor.Header{
                 id: _,
                 level: 2,
                 value: "Header2",
                 metadata: %{
                   headers: ["Header1"]
                 }
               },
               %DocumentProcessor.Paragraph{
                 id: _,
                 level: 3,
                 value: "Para",
                 metadata: %{
                   headers: ["Header1", "Header2"]
                 }
               }
             ] = result
    end
  end
end
