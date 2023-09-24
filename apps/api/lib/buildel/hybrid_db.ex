defmodule Buildel.HybridDB do
  require Logger

  def query(collection_name, query) do
    {time, search_results} = :timer.tc(fn -> Buildel.SearchDB.query(collection_name, query) end)
    Logger.info("Search took #{time / 1_000_000} seconds")

    {time, vector_results} =
      :timer.tc(fn -> Buildel.VectorDB.query(collection_name, query, api_key: api_key()) end)

    Logger.info("Vector search took #{time / 1_000_000} seconds")

    {time, sort_results} =
      :timer.tc(fn ->
        join_results(search_results, vector_results)
        |> sort_results_by_query(query)
      end)

    Logger.info("Sorting took #{time / 1_000_000} seconds")

    sort_results
  end

  defp sort_results_by_query(results, query) do
    sorted_results =
      Nx.Serving.batched_run(
        __MODULE__,
        results |> Enum.map(fn result -> {result["document"], query} end)
      )
      |> Map.get(:logits)
      |> Nx.to_list()
      |> Enum.zip(results)
      |> Enum.sort_by(fn {[score], _result} -> score end, &>=/2)
      |> Enum.map(fn {_score, result} -> result end)

    """
    results without sorting
    #{results |> Enum.map(fn result -> result["metadata"]["chunk_id"] end) |> Enum.join("\n")}

    results with sorting
    #{sorted_results |> Enum.map(fn result -> result["metadata"]["chunk_id"] end) |> Enum.join("\n")}
    """
    |> Logger.debug()

    sorted_results
  end

  def serving() do
    {:ok, model_info} = Bumblebee.load_model({:hf, "cross-encoder/ms-marco-TinyBERT-L-2-v2"})
    {:ok, tokenizer} = Bumblebee.load_tokenizer({:hf, "bert-base-uncased"})
    batch_size = 4

    Nx.Serving.new(
      fn _ ->
        {_init_fn, predict_fn} = Axon.build(model_info.model, compiler: EXLA)

        fn %{size: size} = inputs ->
          inputs = Nx.Batch.pad(inputs, batch_size - size)
          {time, prediction_result} = :timer.tc(fn -> predict_fn.(model_info.params, inputs) end)
          Logger.info("Prediction took #{time / 1_000_000} seconds")
          prediction_result
        end
      end,
      batch_size: batch_size
    )
    |> Nx.Serving.client_preprocessing(fn input ->
      inputs = Bumblebee.apply_tokenizer(tokenizer, input)

      {Nx.Batch.concatenate([inputs]), :ok}
    end)
  end

  defp join_results(search_results, vector_results) do
    Enum.uniq_by(search_results ++ vector_results, & &1["metadata"]["chunk_id"])
  end

  defp api_key do
    System.fetch_env!("OPENAI_API_KEY")
  end
end
