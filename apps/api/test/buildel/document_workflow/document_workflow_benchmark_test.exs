defmodule Buildel.DocumentWorkflow.DocumentWorkflowBenchmarkTest do
  use BuildelWeb.ConnCase, async: true

  alias Buildel.Clients.Embeddings
  alias Buildel.DocumentWorkflow

  @cases [
    %{
      query: "Przychody Przyszłych Okresów",
      chunks: ["Przychody przyszłych okresów", "Pasywa", "Fundusze specjalne", "ZAŁĄCZNIK Nr 3"]
    }
  ]

  test "benchmark" do
    # run_benchmark()
  end

  defp run_benchmark() do
    vector_db = init_db()

    DocumentWorkflow.read({"foo", %{}})
    |> DocumentWorkflow.build_node_chunks()
    |> DocumentWorkflow.generate_embeddings()

    benchmark_results =
      @cases
      |> Enum.map(fn item ->
        results =
          vector_db
          |> Buildel.VectorDB.query("test", item.query, %{}, %{
            similarity_threshhold: 0,
            limit: 100
          })

        indices =
          item.chunks
          |> Enum.map(fn chunk ->
            index = find_index(results, chunk)

            if index != nil do
              %{
                index: index,
                chunk: chunk,
                result: results |> Enum.at(index)
              }
            else
              %{
                index: -1,
                chunk: chunk,
                result: nil
              }
            end
          end)
      end)
      |> IO.inspect()

    File.write(
      "./test/buildel/document_workflow/benchmark_results/#{:os.system_time(:seconds)}_benchmark_result.json",
      Jason.encode!(benchmark_results)
    )
  end

  defp find_index(results, text) do
    results |> Enum.find_index(fn x -> String.contains?(x["document"], text) end)
  end

  defp init_db() do
    embeddings_adapter =
      Embeddings.new(%{
        api_key: "",
        model: "text-embedding-3-small",
        api_type: "openai"
      })

    database_adapter = Buildel.VectorDB.EctoAdapter
    vector_db = Buildel.VectorDB.new(%{adapter: database_adapter, embeddings: embeddings_adapter})

    vector_db
    |> Buildel.VectorDB.init("test")

    vector_db
  end
end
