defmodule Buildel.Langchain.ChatGptTokenizer do
  defstruct [:model, :tokenizer]

  def init(model) do
    {:ok, tokenizer} =
      Tokenizers.Tokenizer.from_file("./lib/buildel/langchain/gpt-tokenizer.json")

    %__MODULE__{model: model, tokenizer: tokenizer}
  end

  def count_chain_tokens(%__MODULE__{} = tokenizer, %{
        functions: functions,
        messages: messages,
        input_messages: input_messages
      }) do
    function_message_tokens =
      functions
      |> Enum.map(fn function ->
        tokenizer |> count_function_tokens(function)
      end)
      |> Enum.sum()

    input_message_tokens =
      messages
      |> Enum.take(input_messages |> Enum.count())
      |> Enum.map(fn message ->
        tokenizer |> count_message_tokens(message)
      end)
      |> Enum.sum()

    output_message_tokens =
      messages
      |> Enum.drop(input_messages |> Enum.count())
      |> Enum.map(fn message ->
        tokenizer |> count_message_tokens(message)
      end)
      |> Enum.sum()

    %Buildel.Langchain.ChatTokenSummary{
      model: tokenizer.model,
      input_tokens: input_message_tokens + function_message_tokens,
      output_tokens: output_message_tokens
    }
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        function_name: function_name,
        arguments: arguments,
        content: nil
      })
      when is_binary(function_name) do
    count_text_tokens(tokenizer, function_name) +
      count_text_tokens(tokenizer, arguments |> Jason.encode!())
  end

  def count_message_tokens(%__MODULE__{}, %{content: nil}) do
    0
  end

  def count_message_tokens(%__MODULE__{tokenizer: tokenizer}, %{content: content}) do
    {:ok, encoding} = Tokenizers.Tokenizer.encode(tokenizer, content)
    (encoding |> Tokenizers.Encoding.n_tokens()) + 7
  end

  def count_function_tokens(%__MODULE__{} = tokenizer, %{
        name: function_name,
        description: description,
        parameters_schema: parameters_schema
      })
      when is_binary(function_name) do
    count_text_tokens(tokenizer, function_name) +
      count_text_tokens(tokenizer, description) +
      count_text_tokens(tokenizer, parameters_schema |> Jason.encode!())
  end

  defp count_text_tokens(%__MODULE__{tokenizer: tokenizer}, text) do
    {:ok, encoding} = Tokenizers.Tokenizer.encode(tokenizer, text)
    encoding |> Tokenizers.Encoding.n_tokens()
  end
end
