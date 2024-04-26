defmodule Buildel.Langchain.EmbeddingsTokenSummary do
  defstruct [:model, :endpoint, :tokens]

  def empty do
    %Buildel.Langchain.EmbeddingsTokenSummary{
      model: nil,
      endpoint: "https://api.openai.com/v1/embeddings",
      tokens: 0
    }
  end
end
