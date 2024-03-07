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
                 keyword: "header1",
                 embeddings: nil
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " header2 li2 header3",
                 keyword: "header1",
                 embeddings: nil
               }
             ] = result
    end
  end
end
