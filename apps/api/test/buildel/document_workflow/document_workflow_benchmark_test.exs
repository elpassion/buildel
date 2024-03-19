defmodule Buildel.DocumentWorkflow.DocumentWorkflowBenchmarkTest do
  use BuildelWeb.ConnCase, async: true

  # alias Buildel.Clients.Embeddings
  # alias Buildel.DocumentWorkflow

  # @cases [
  #   %{
  #     query: "Przychody Przyszłych Okresów",
  #     chunks: ["Przychody przyszłych okresów", "Pasywa", "Fundusze specjalne", "ZAŁĄCZNIK Nr 3"]
  #   },
  #   %{
  #     query: "środki trwałe w budowie",
  #     chunks: ["środkach trwałych w budowie", "16)", "Art. 3. [Definicje]"]
  #   },
  #   %{
  #     query: "wartość nabycia",
  #     chunks: [
  #       "Wartość firmy stanowi różnicę",
  #       "Art. 33. [Wycena i amortyzacja wartości niematerialnych i prawnych]",
  #       "4.",
  #       "44b ust. 10-12"
  #     ]
  #   },
  #   %{
  #     query: "środek trwały czy zapas",
  #     chunks: ["d) inwentarz żywy", "dłuższym niż rok", "15)", "Art. 3. [Definicje]"]
  #   },
  #   %{
  #     query: "rok obrotowy dłuższy niż 12 miesięcy",
  #     chunks: ["9) roku obrotowym - rozumie się przez to rok", "Art. 3. [Definicje]"]
  #   }
  # ]

  test "benchmark" do
    # run_benchmark()
  end

  # defp run_benchmark() do
  #   vector_db = init_db()

  #   chunks_config = %{
  #     chunk_size: 300
  #   }

  #   workflow =
  #     DocumentWorkflow.new(%{
  #       embeddings:
  #         Buildel.Clients.Embeddings.new(%{
  #           api_type: "openai",
  #           model: "text-embedding-3-small",
  #           api_key: System.get_env("OPENAI_API_KEY")
  #         }),
  #       collection_name: "test",
  #       db_adapter: Buildel.VectorDB.EctoAdapter
  #     })

  #   DocumentWorkflow.read(workflow, {"foo", %{}})
  #   |> DocumentWorkflow.build_node_chunks(chunks_config)
  #   |> DocumentWorkflow.generate_embeddings()

  #   benchmark_results =
  #     @cases
  #     |> Enum.map(fn item ->
  #       results =
  #         vector_db
  #         |> Buildel.VectorDB.query("test", item.query, %{}, %{
  #           similarity_threshhold: 0,
  #           limit: 100
  #         })

  #       %{
  #         query: item.query,
  #         results:
  #           item.chunks
  #           |> Enum.map(fn chunk ->
  #             index = find_index(results, chunk)

  #             if index != nil do
  #               %{
  #                 index: index,
  #                 chunk: chunk,
  #                 result: results |> Enum.at(index)
  #               }
  #             else
  #               %{
  #                 index: -1,
  #                 chunk: chunk,
  #                 result: nil
  #               }
  #             end
  #           end)
  #       }
  #     end)

  #   data = generate_statistics(benchmark_results, chunks_config)

  #   File.write(
  #     "./test/buildel/document_workflow/benchmark_results/#{:os.system_time(:seconds)}_benchmark_result.json",
  #     Jason.encode!(data)
  #   )
  # end

  # defp generate_statistics(benchmark_results, chunks_config) do
  #   partial_stats =
  #     Enum.map(benchmark_results, fn %{query: query, results: results} ->
  #       avg_result_index =
  #         Enum.reduce(results, 0, fn el, acc -> acc + el.index end) /
  #           length(results)

  #       success_results =
  #         results
  #         |> Enum.filter(fn el -> el.index != -1 end)

  #       best_result_index =
  #         if length(success_results) > 0 do
  #           Enum.min_by(success_results, fn el -> el.index end).index
  #         else
  #           -1
  #         end

  #       avg_success_result_index =
  #         results
  #         |> Enum.filter(fn el -> el.index != -1 end)
  #         |> Enum.reduce(0, fn el, acc -> acc + el.index end)
  #         |> (fn el -> el / length(results) end).()

  #       failed_hits = results |> Enum.filter(fn el -> el.index == -1 end) |> length()
  #       total_hits = results |> length()

  #       %{
  #         meta: %{
  #           query: query,
  #           best_result_index: best_result_index,
  #           avg_result_index: avg_result_index,
  #           avg_success_result_index: avg_success_result_index,
  #           failed_hits: failed_hits,
  #           total_hits: total_hits
  #         },
  #         results: results
  #       }
  #     end)

  #   success_results = Enum.filter(partial_stats, fn el -> el.meta.best_result_index != -1 end)
  #   failed_results = Enum.filter(partial_stats, fn el -> el.meta.best_result_index == -1 end)

  #   avg_best_result_index =
  #     if length(success_results) > 0 do
  #       Enum.reduce(success_results, 0, fn el, acc -> acc + el.meta.best_result_index end) /
  #         length(success_results)
  #     else
  #       -1
  #     end

  #   %{
  #     meta: %{
  #       failed_results: failed_results |> length(),
  #       avg_best_result_index: avg_best_result_index,
  #       chunks_config: chunks_config
  #     },
  #     data: partial_stats
  #   }
  # end

  # defp find_index(results, text) do
  #   results |> Enum.find_index(fn x -> String.contains?(x["document"], text) end)
  # end

  # defp init_db() do
  #   embeddings_adapter =
  #     Embeddings.new(%{
  #       api_key: System.get_env("OPENAI_API_KEY"),
  #       model: "text-embedding-3-small",
  #       api_type: "openai"
  #     })

  #   database_adapter = Buildel.VectorDB.EctoAdapter
  #   vector_db = Buildel.VectorDB.new(%{adapter: database_adapter, embeddings: embeddings_adapter})

  #   vector_db
  #   |> Buildel.VectorDB.init("test")

  #   vector_db
  # end
end
