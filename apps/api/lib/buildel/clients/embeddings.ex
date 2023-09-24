defmodule Buildel.Clients.EmbeddingsBehaviour do
  @callback get_embeddings(inputs: list(String.t())) :: {:ok, list(list(float()))}
  @callback collection_config() :: map()
end

defmodule Buildel.Clients.OpenAIEmbeddings do
  @behaviour Buildel.Clients.EmbeddingsBehaviour

  @impl true
  def collection_config() do
    %{size: 1536, distance: "Cosine"}
  end

  @impl true
  def get_embeddings(inputs: inputs, api_key: api_key) do
    {:ok, %{data: gpt_embeddings}} =
      OpenAI.embeddings([model: "text-embedding-ada-002", input: inputs], config(false, api_key))

    {:ok, gpt_embeddings |> Enum.map(fn %{"embedding" => embedding} -> embedding end)}
  end

  def config(stream \\ false, api_key \\ nil) do
    http_options =
      if stream, do: [recv_timeout: :infinity, stream_to: self(), async: :once], else: []

    %OpenAI.Config{
      api_key: api_key || System.get_env("OPENAI_API_KEY"),
      http_options: http_options,
      api_url: "http://localhost/"
    }
  end
end

defmodule Buildel.Clients.BumblebeeEmbeddings do
  @behaviour Buildel.Clients.EmbeddingsBehaviour

  @sequence_length 128

  @impl true
  def get_embeddings(inputs: texts, api_key: _api_key) do
    results =
      Nx.Serving.batched_run(__MODULE__, texts)
      |> Enum.map(& &1[:embedding])
      |> Enum.map(&Nx.to_list/1)

    {:ok, results}
  end

  @impl true
  def collection_config() do
    %{size: 384, distance: "Dot"}
  end

  def serving() do
    {:ok, model_info} =
      Bumblebee.load_model({:hf, "sentence-transformers/all-MiniLM-L6-v2"})

    {:ok, tokenizer} =
      Bumblebee.load_tokenizer({:hf, "sentence-transformers/all-MiniLM-L6-v2"})

    Bumblebee.Text.TextEmbedding.text_embedding(model_info, tokenizer,
      compile: [batch_size: 32, sequence_length: [16, 32, 64, 128, 512]],
      defn_options: [compiler: EXLA]
    )
  end
end
