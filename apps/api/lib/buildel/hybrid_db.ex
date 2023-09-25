defmodule Buildel.HybridDB do
  require Logger
  use Buildel.Utils.TelemetryWrapper

  @batch_size 16

  deftimed query(collection_name, query), [:buildel, :hybrid_db, :query] do
    query = query |> String.trim() |> String.downcase()

    search_results = Buildel.SearchDB.query(collection_name, query)

    vector_results = Buildel.VectorDB.query(collection_name, query, api_key: api_key())

    join_results(search_results, vector_results)
    |> sort_results_by_query(query)
  end

  deftimedp sort_results_by_query(results, query), [:buildel, :hybrid_db, :sorting] do
    cached_results =
      results
      |> Enum.map(fn result -> "sortings::#{result["metadata"]["chunk_id"]}::#{query}" end)
      |> Enum.map(&Buildel.DocumentCache.get/1)

    missing_results =
      cached_results
      |> Enum.zip(results)
      |> Enum.filter(fn
        {nil, _} -> true
        {_cached_result, _result} -> false
      end)
      |> Enum.map(fn {_cached_result, result} -> result end)

    result_tuples = missing_results |> Enum.map(fn result -> {result["document"], query} end)

    processed_missing_results =
      if Enum.empty?(missing_results) do
        []
      else
        Nx.Serving.batched_run(__MODULE__, result_tuples)
        |> Map.get(:logits)
        |> Nx.to_list()
        |> Enum.zip(missing_results)
        |> Enum.map(fn {_, document} = result ->
          Buildel.DocumentCache.put(
            "sortings::#{document["metadata"]["chunk_id"]}::#{query}",
            result
          )
        end)
      end

    processed_cached_results = cached_results |> Enum.filter(&(&1 != nil))

    sorted_results =
      (processed_cached_results ++ processed_missing_results)
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

    Nx.Serving.new(fn _ ->
      {_init_fn, predict_fn} = Axon.build(model_info.model, compiler: EXLA)

      fn %{size: size} = inputs ->
        inputs = Nx.Batch.pad(inputs, @batch_size - size)
        {time, prediction_result} = :timer.tc(fn -> predict_fn.(model_info.params, inputs) end)

        :telemetry.execute(
          [:buildel, :hybrid_db, :sorting, :batch_processing],
          %{duration: time * 1000}
        )

        prediction_result
      end
    end)
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
