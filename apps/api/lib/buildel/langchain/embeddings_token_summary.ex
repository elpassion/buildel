defmodule Buildel.Langchain.EmbeddingsTokenSummary do
  defstruct [:model, :tokens, endpoint: "https://api.openai.com/v1/embeddings"]
end
