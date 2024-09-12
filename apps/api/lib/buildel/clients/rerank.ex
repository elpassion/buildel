defmodule Buildel.Clients.Rerank do
  defstruct [:adapter]

  def new("cohere", %{api_key: api_key}) do
    adapter = Buildel.Clients.Cohere.new(api_key)

    %__MODULE__{adapter: adapter}
  end

  defmodule Params do
    defstruct [:inputs, :model, :query, :top_n]

    def new(args) do
      %__MODULE__{
        inputs: args[:inputs],
        model: args[:model],
        query: args[:query],
        top_n: args[:top_n]
      }
    end
  end

  defmodule Result do
    @derive Jason.Encoder
    defstruct [:reranked_documents]

    def new(%{reranked_documents: reranked_documents}) do
      %__MODULE__{reranked_documents: reranked_documents}
    end
  end

  def rerank(
        %__MODULE__{adapter: %Buildel.Clients.Cohere{} = adapter},
        %Params{} = rerank_params
      ) do
    with {:ok, response} <-
           Buildel.Clients.Cohere.rerank(adapter, %{
             documents: rerank_params.inputs,
             query: rerank_params.query,
             top_n: rerank_params.top_n,
             model: rerank_params.model
           }) do
      {:ok,
       Buildel.Clients.Rerank.Result.new(%{
         reranked_documents: response.results
       })}
    else
      {:error, error} ->
        {:error, error}
    end
  end
end
