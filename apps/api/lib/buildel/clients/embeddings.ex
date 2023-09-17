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

  @batch_size 8
  @sequence_length 500

  @impl true
  def get_embeddings(inputs: texts, api_key: _api_key) do
    {:ok, Nx.Serving.batched_run(__MODULE__, texts) |> Nx.to_list()}
  end

  @impl true
  def collection_config() do
    %{size: 384, distance: "Dot"}
  end

  def serving() do
    {:ok, %{model: model, params: params}} =
      Bumblebee.load_model({:hf, "sentence-transformers/paraphrase-MiniLM-L6-v2"})

    {:ok, tokenizer} =
      Bumblebee.load_tokenizer({:hf, "sentence-transformers/paraphrase-MiniLM-L6-v2"})

    {_init_fn, predict_fn} = Axon.build(model, compiler: EXLA)

    Nx.Serving.new(fn _config ->
      fn %{size: size} = inputs ->
        inputs = Nx.Batch.pad(inputs, @batch_size - size)
        predict_fn.(params, inputs)[:pooled_state]
      end
    end)
    |> Nx.Serving.client_preprocessing(fn input ->
      inputs =
        Bumblebee.apply_tokenizer(tokenizer, input,
          length: @sequence_length,
          return_token_type_ids: false
        )

      {Nx.Batch.concatenate([inputs]), :ok}
    end)
  end
end
