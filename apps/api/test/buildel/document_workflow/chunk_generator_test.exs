defmodule Buildel.ChunkGeneratorTest do
  use ExUnit.Case
  alias Buildel.DocumentWorkflow

  describe "split_into_chunks/1" do
    test "should split into chunks based od config" do
      list = DocumentWorkflow.read({"foo", %{}})
      result = DocumentWorkflow.ChunkGenerator.split_into_chunks(list, %{chunk_size: 20})

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " Para1 header1 li11 li12",
                 keywords: ["header1"],
                 embeddings: nil
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " header2 li2 header3",
                 keywords: ["header1"],
                 embeddings: nil
               }
             ] = result
    end
  end

  describe "add_neighbors/1" do
    test "correctly assigns next nad prev" do
      list = DocumentWorkflow.read({"foo", %{}})

      result =
        DocumentWorkflow.ChunkGenerator.split_into_chunks(list, %{chunk_size: 13})
        |> DocumentWorkflow.ChunkGenerator.add_neighbors()

      first_id = Enum.at(result, 0).id
      second_id = Enum.at(result, 1).id
      third_id = Enum.at(result, 2).id

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 prev: nil,
                 next: second_id
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 prev: first_id,
                 next: third_id
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 prev: second_id,
                 next: nil
               }
             ] = result
    end
  end
end
