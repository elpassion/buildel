defmodule Buildel.HybridDB do
  def query(collection_name, query) do
    search_results =
      search_db().query(collection_name, query)

    vector_results =
      vector_db().query(collection_name, query, api_key: api_key())

    join_results(search_results, vector_results)
    |> sort_results_by_query(query)
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
