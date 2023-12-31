defmodule Buildel.Clients.ChatGPT do
  require Logger
  alias Buildel.Langchain.ChatGptTokenizer
  alias Buildel.Clients.ChatBehaviour
  alias LangChain.Chains.LLMChain
  alias Buildel.LangChain.ChatModels.ChatOpenAI
  alias LangChain.Message
  alias LangChain.MessageDelta

  @behaviour ChatBehaviour

  @impl ChatBehaviour
  def stream_chat(
        context: context,
        on_content: on_content,
        on_tool_content: on_tool_content,
        on_end: on_end,
        on_error: on_error,
        api_key: api_key,
        model: model,
        temperature: temperature,
        tools: tools
      ) do
    messages =
      context.messages
      |> Enum.map(fn
        %{role: "assistant"} = message -> Message.new_assistant!(message.content)
        %{role: "system"} = message -> Message.new_system!(message.content)
        %{role: "user"} = message -> Message.new_user!(message.content)
        %{role: "tool"} = message -> Message.new_function!(message.tool_name, message.content)
      end)

    with {:ok, chain, _} <-
           LLMChain.new!(%{
             llm:
               ChatOpenAI.new!(%{
                 model: model,
                 temperature: temperature,
                 stream: true,
                 api_key: api_key
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

               %Message{function_name: function_name, content: content}
               when is_binary(function_name) and is_binary(content) ->
                 on_tool_content.(function_name, content)

               %Message{} ->
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

      :ok
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
