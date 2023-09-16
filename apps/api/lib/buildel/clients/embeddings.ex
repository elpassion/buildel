defmodule Buildel.Clients.EmbeddingsBehaviour do
  @callback get_embeddings(inputs: list()) :: {:ok, map()}
end

defmodule Buildel.Clients.OpenAIEmbeddings do
  @behaviour Buildel.Clients.EmbeddingsBehaviour

  @impl true
  def get_embeddings(inputs: inputs, api_key: api_key) do
    OpenAI.embeddings([model: "text-embedding-ada-002", input: inputs], config(false, api_key))
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
