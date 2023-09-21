defmodule Buildel.HybridDB do
  require Logger

  def query(collection_name, query) do
    {time, search_results} = :timer.tc(fn -> search_db().query(collection_name, query) end)
    Logger.debug("Search took #{time / 1_000_000} seconds")

    {time, vector_results} =
      :timer.tc(fn -> vector_db().query(collection_name, query, api_key: api_key()) end)

    Logger.debug("Vector search took #{time / 1_000_000} seconds")

    {time, sort_results} =
      :timer.tc(fn ->
        join_results(search_results, vector_results)
        |> sort_results_by_query(query)
      end)

    Logger.debug("Sorting took #{time / 1_000_000} seconds")

    sort_results
  end

  defp sort_results_by_query(results, query) do
    {:ok, %{model: model, params: params}} =
      Bumblebee.load_model({:hf, "cross-encoder/ms-marco-TinyBERT-L-2-v2"})

    {:ok, tokenizer} = Bumblebee.load_tokenizer({:hf, "bert-base-uncased"})

    inputs =
      Bumblebee.apply_tokenizer(
        tokenizer,
        results |> Enum.map(fn %{"document" => document} -> {query, document} end)
      )

    %{logits: tensor} = Axon.predict(model, params, inputs)

    tensor
    |> Nx.to_list()
    |> Enum.zip(results)
    |> Enum.sort(fn {a, _}, {b, _} -> a > b end)
    |> Enum.map(fn {_, result} -> result end)
  end

  defp join_results(search_results, vector_results) do
    Enum.uniq_by(search_results ++ vector_results, & &1["metadata"]["chunk_id"])
  end

  defp api_key do
    System.fetch_env!("OPENAI_API_KEY")
  end

  defp search_db do
    Application.get_env(:bound, :search_db, Buildel.SearchDB)
  end

  defp vector_db do
    Application.get_env(:bound, :vector_db, Buildel.VectorDB)
  end
end
