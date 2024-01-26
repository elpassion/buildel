defmodule Buildel.Clients.ChatGPT do
  require Logger
  alias Buildel.Langchain.ChatGptTokenizer
  alias Buildel.Clients.ChatBehaviour
  alias Buildel.LangChain.Chains.LLMChain
  alias Buildel.LangChain.ChatModels.ChatOpenAI
  alias LangChain.Message
  alias LangChain.MessageDelta

  @behaviour ChatBehaviour

  @impl ChatBehaviour
  def stream_chat(
        %{
          context: context,
          on_content: on_content,
          on_tool_content: on_tool_content,
          on_tool_call: on_tool_call,
          on_end: on_end,
          on_error: on_error,
          api_key: api_key,
          model: model,
          temperature: temperature,
          tools: tools
        } = opts
      ) do
    api_type = opts |> Map.get(:api_type, "openai")
    endpoint = opts |> Map.get(:endpoint, "https://api.openai.com/v1/chat/completions")

    messages =
      context.messages
      |> Enum.map(fn
        %{role: "assistant"} = message ->
          Message.new_assistant!(message.content)

        %{role: "system"} = message ->
          Message.new_system!(message.content)

        %{role: "user"} = message ->
          Message.new_user!(message.content)

        %{role: "tool"} = message ->
          Message.new_function!(message.tool_name, message.content)

        %{role: "tool_call"} = message ->
          Message.new_function_call!(message.tool_name, Jason.encode!(message.arguments))
      end)

    with {:ok, chain, message} <-
           LLMChain.new!(%{
             llm:
               ChatOpenAI.new!(%{
                 model: model,
                 temperature: temperature,
                 stream: true,
                 api_key: api_key,
                 api_type: api_type,
                 endpoint: endpoint
               }),
             custom_context: context
           })
           |> LLMChain.add_functions(tools)
           |> LLMChain.add_messages(messages)
           |> LLMChain.run(
             while_needs_response: true,
             callback_fn: fn
               %MessageDelta{content: nil} ->
                 nil

               %MessageDelta{} = data ->
                 on_content.(data.content)

               %Message{function_name: nil} ->
                 nil

               %Message{function_name: function_name, content: content, arguments: nil}
               when is_binary(function_name) and is_binary(content) ->
                 on_tool_content.(function_name, content)

               %Message{function_name: function_name, arguments: arguments}
               when is_binary(function_name) ->
                 on_tool_call.(function_name, arguments)

               %Message{} ->
                 nil

               {:error, reason} ->
                 on_error.(reason)
                 nil
             end
           ) do
      statistics =
        ChatGptTokenizer.init(model)
        |> ChatGptTokenizer.count_chain_tokens(%{
          functions: chain.functions,
          messages: chain.messages,
          input_messages: chain.custom_context.messages
        })

      on_end.(statistics)

      {:ok, chain, message}
    else
      {:error, "context_length_exceeded"} ->
        on_error.(:context_length_exceeded)
        {:error, :context_length_exceeded}

      {:error, reason} ->
        on_error.(reason)
        {:error, reason}
    end
  end
end
