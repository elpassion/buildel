defmodule Buildel.Langchain.ChatGptTokenizer do
  require Logger

  defstruct [:model, :tokenizer]

  def init(model) do
    tokenizer_dir = Application.app_dir(:buildel, "priv/models/tokenizers")

    {:ok, tokenizer} =
      Tokenizers.Tokenizer.from_file("#{tokenizer_dir}/gpt-tokenizer.json")

    %__MODULE__{model: model, tokenizer: tokenizer}
  end

  def count_chain_tokens(%__MODULE__{} = tokenizer, %{
        functions: functions,
        messages: output_messages,
        input_messages: input_messages
      }) do
    function_metadata_tokens =
      functions
      |> Enum.map(fn function -> count_function_tokens(tokenizer, function) + 4 end)
      |> Enum.sum()

    function_metadata_tokens =
      if function_metadata_tokens > 0 do
        function_metadata_tokens + 4
      else
        function_metadata_tokens
      end

    input_message_tokens =
      input_messages
      |> Enum.map(fn message -> count_message_tokens(tokenizer, message) + 4 end)
      |> Enum.sum()

    input_message_tokens = input_message_tokens + 3

    output_message_tokens =
      output_messages
      |> Enum.map(&count_message_tokens(tokenizer, &1))
      |> Enum.sum()

    summary = %Buildel.Langchain.ChatTokenSummary{
      model: tokenizer.model,
      endpoint: "openai",
      input_tokens: input_message_tokens + function_metadata_tokens,
      output_tokens: output_message_tokens
    }

    Logger.debug("ChatTokenSumary: #{inspect(summary)}")

    summary
  end

  def count_message_tokens(%__MODULE__{}, %{content: nil, function_name: nil, arguments: nil}) do
    0
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        content: nil,
        function_name: nil,
        arguments: arguments
      }) do
    count_text_tokens(tokenizer, arguments)
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        content: nil,
        function_name: function_name,
        arguments: nil
      }) do
    count_text_tokens(tokenizer, function_name)
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        function_name: function_name,
        arguments: arguments,
        content: nil
      })
      when is_binary(function_name) do
    count_text_tokens(tokenizer, function_name) +
      count_text_tokens(tokenizer, arguments |> Jason.encode!()) + 7
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        content: content,
        function_name: nil
      }) do
    count_text_tokens(tokenizer, content)
  end

  def count_message_tokens(%__MODULE__{} = tokenizer, %{
        content: content,
        function_name: function_name
      }) do
    count_text_tokens(tokenizer, function_name) +
      count_text_tokens(tokenizer, content) + 7
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

  def count_text_tokens(%__MODULE__{tokenizer: tokenizer}, text) do
    {:ok, encoding} = Tokenizers.Tokenizer.encode(tokenizer, text)
    encoding |> Tokenizers.Encoding.n_tokens()
  end
end
