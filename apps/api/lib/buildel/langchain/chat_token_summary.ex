defmodule Buildel.Langchain.ChatTokenSummary do
  defstruct [:model, :endpoint, :input_tokens, :output_tokens]

  def empty do
    %Buildel.Langchain.ChatTokenSummary{
      model: nil,
      endpoint: nil,
      input_tokens: 0,
      output_tokens: 0
    }
  end
end
