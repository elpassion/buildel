defmodule Buildel.ChunkGeneratorTest do
  use ExUnit.Case
  alias Buildel.DocumentWorkflow
  setup [:create_workflow]

  describe "split_into_chunks/1" do
    test "should overlap chunks based od config", %{workflow: workflow} do
      list = DocumentWorkflow.read(workflow, {"foo", %{}})

      config = Map.put(workflow.workflow_config, :chunk_overlap, 5)
      result = DocumentWorkflow.ChunkGenerator.split_into_chunks(list, config)

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " Para1 header1 li11 li12",
                 embeddings: nil
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " li12 header2 li2 header3",
                 embeddings: nil
               }
             ] = result
    end

    test "should split into chunks based od config", %{workflow: workflow} do
      list = DocumentWorkflow.read(workflow, {"foo", %{}})
      result = DocumentWorkflow.ChunkGenerator.split_into_chunks(list, workflow.workflow_config)

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " Para1 header1 li11 li12",
                 embeddings: nil
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 value: " header2 li2 header3",
                 embeddings: nil
               }
             ] = result
    end

    test "should add metadata to chunks", %{workflow: workflow} do
      list = DocumentWorkflow.read(workflow, {"foo", %{}})

      result =
        DocumentWorkflow.ChunkGenerator.split_into_chunks(list, workflow.workflow_config)

      first_chunk_building_block_ids = list |> Enum.map(& &1.id) |> Enum.take(3)
      second_chunk_building_block_ids = list |> Enum.map(& &1.id) |> Enum.drop(3)

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 metadata: %{
                   keywords: ["header1"],
                   building_block_ids: ^first_chunk_building_block_ids
                 }
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 metadata: %{
                   keywords: ["header1"],
                   building_block_ids: ^second_chunk_building_block_ids
                 }
               }
             ] = result
    end
  end

  describe "add_neighbors/1" do
    test "correctly assigns next nad prev", %{workflow: workflow} do
      list = DocumentWorkflow.read(workflow, {"foo", %{}})

      result =
        DocumentWorkflow.ChunkGenerator.split_into_chunks(list, %{chunk_size: 13})
        |> DocumentWorkflow.ChunkGenerator.add_neighbors()

      first_id = Enum.at(result, 0).id
      second_id = Enum.at(result, 1).id
      third_id = Enum.at(result, 2).id

      assert [
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 metadata: %{
                   prev: nil,
                   next: ^second_id
                 }
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 metadata: %{
                   prev: ^first_id,
                   next: ^third_id
                 }
               },
               %DocumentWorkflow.ChunkGenerator.Chunk{
                 id: _,
                 metadata: %{
                   prev: ^second_id,
                   next: nil
                 }
               }
             ] = result
    end
  end

  defp create_workflow(_context) do
    workflow =
      DocumentWorkflow.new(%{
        embeddings:
          Buildel.Clients.Embeddings.new(%{
            api_type: "test",
            model: "test",
            api_key: "test"
          }),
        collection_name: "test",
        db_adapter: Buildel.VectorDB.EctoAdapter,
        workflow_config: %{
          chunk_size: 20,
          chunk_overlap: 0
        }
      })

    %{workflow: workflow}
  end
end
