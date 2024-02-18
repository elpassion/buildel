defmodule Buildel.LangChain.ChatGptTokenizerTest do
  alias Buildel.Langchain.ChatGptTokenizer

  use Buildel.LangChain.BaseCase

  test "correctly counts tokens" do
    tokenizer = ChatGptTokenizer.init("gpt-3.5-turbo")

    messages = [
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: "query",
        role: :assistant,
        arguments: ""
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: "{\""
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: "query"
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: "\":\""
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: "TEST"
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :incomplete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: "\"}"
      },
      %LangChain.MessageDelta{
        content: nil,
        status: :complete,
        index: 0,
        function_name: nil,
        role: :unknown,
        arguments: nil
      }
    ]

    assert ChatGptTokenizer.count_chain_tokens(tokenizer, %{
             functions: [],
             input_messages: [],
             messages: messages
           }) == %Buildel.Langchain.ChatTokenSummary{
             model: "gpt-3.5-turbo",
             endpoint: "openai",
             input_tokens: 3,
             output_tokens: 14
           }
  end
end
