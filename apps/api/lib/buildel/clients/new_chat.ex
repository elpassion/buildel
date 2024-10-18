defmodule Buildel.Clients.NewChat do
  require Logger
  alias LangChain.Message.ContentPart
  alias LangChain.Message.ToolResult
  alias LangChain.Message.ToolCall
  alias LangChain.ChatModels.ChatMistralAI
  alias LangChain.ChatModels.ChatOpenAI
  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.ChatModels.ChatAnthropic
  alias LangChain.Message
  alias LangChain.Chains.LLMChain

  @spec stream_chat(list()) :: {:ok, any} | {:error, any}
  def stream_chat(opts) do
    opts =
      Keyword.validate!(opts, [
        :messages,
        :model,
        :api_key,
        tools: [],
        on_cost: fn _ -> nil end,
        on_content: fn _ -> nil end,
        on_message: fn _ -> nil end,
        on_error: fn _ -> nil end,
        on_end: fn -> nil end,
        on_tool_content: fn _ -> nil end,
        on_tool_call: fn _ -> nil end,
        api_type: "openai",
        temperature: 0.7,
        max_tokens: nil,
        endpoint: "https://api.openai.com/v1",
        response_format: "text"
      ])
      |> Enum.into(%{})

    handler = %{
      on_llm_new_delta: on_llm_new_delta(opts[:on_content]),
      on_llm_token_usage: on_llm_token_usage(opts[:on_cost], opts[:model], opts[:endpoint])
    }

    llm = get_llm(opts, [handler])

    messages = opts[:messages] |> Enum.map(&langchain_message_from_chat_message/1)

    with {:ok, chain} <-
           LLMChain.new!(%{
             llm: llm,
             custom_context: %{}
           })
           |> LLMChain.add_tools(opts[:tools] |> Enum.map(& &1.function))
           |> LLMChain.add_messages(messages)
           |> LLMChain.add_callback(%{
             on_retries_exceeded: fn _chain ->
               nil
             end,
             on_message_processing_error: fn _chain, _message ->
               nil
             end,
             on_error_message_created: fn _chain, _message ->
               nil
             end,
             on_tool_response_created: fn _chain, message ->
               opts[:on_tool_content].(message.tool_results)
             end,
             on_message_processed: fn _chain, message ->
               if Message.is_tool_call?(message) do
                 opts[:on_tool_call].(message.tool_calls)
               end
             end
           })
           |> LLMChain.run(mode: :while_needs_response) do
      opts[:on_end].()

      {:ok, chain, chain.last_message}
    else
      {:error, _chain, reason} ->
        if String.contains?(reason, "maximum context length") do
          {:error, :context_length_exceeded}
        else
          opts[:on_error].(reason)
          {:error, reason}
        end

      _ ->
        {:error, "unknown error"}
    end
  end

  def get_models(%{api_type: "openai"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "/models", Authorization: "Bearer #{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("data")
      |> Enum.map(fn model ->
        %{id: model["id"], name: model["id"], api_type: "openai"}
      end)
    else
      _ ->
        []
    end
  end

  def get_models(%{api_type: "mistral"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "/models", Authorization: "Bearer #{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("data")
      |> Enum.map(fn model ->
        %{id: model["id"], name: model["id"], api_type: "mistral"}
      end)
    else
      _ ->
        []
    end
  end

  def get_models(%{api_type: "google"} = opts) do
    with {:ok, %HTTPoison.Response{status_code: status_code, body: body}}
         when status_code >= 200 and status_code < 400 <-
           HTTPoison.get(opts.endpoint <> "?key=#{opts.api_key}") do
      body
      |> Jason.decode!()
      |> Map.get("models")
      |> Enum.map(fn model ->
        %{
          id: model["name"] |> String.split("/") |> Enum.at(1),
          name: model["displayName"],
          api_type: "google"
        }
      end)
    else
      _e ->
        []
    end
  end

  def get_models(%{api_type: "anthropic"}) do
    [
      %{
        id: "claude-3-5-sonnet-20240620",
        name: "anthropic.claude-3-5-sonnet-20240620-v1:0",
        api_type: "anthropic"
      },
      %{
        id: "claude-3-opus-20240229",
        name: "claude-3-opus-20240229",
        api_type: "anthropic"
      },
      %{
        id: "claude-3-sonnet-20240229",
        name: "claude-3-sonnet-20240229",
        api_type: "anthropic"
      },
      %{
        id: "claude-3-haiku-20240307",
        name: "claude-3-haiku-20240307",
        api_type: "anthropic"
      }
    ]
  end

  def get_models(%{api_type: "azure"}) do
    [
      %{
        id: "azure",
        name: "azure",
        api_type: "azure"
      }
    ]
  end

  defp langchain_message_from_chat_message(%{role: "assistant"} = message) do
    Message.new_assistant!(message.content)
  end

  defp langchain_message_from_chat_message(%{role: "system"} = message) do
    Message.new_system!(message.content)
  end

  defp langchain_message_from_chat_message(%{role: "user", content: content})
       when is_binary(content) do
    Message.new_user!(content)
  end

  defp langchain_message_from_chat_message(%{role: "user", content: content_list}) do
    parts =
      content_list
      |> Enum.map(fn
        %{type: :text, content: content} ->
          ContentPart.text!(content)

        %{type: :image, content: base64_image, media: media} ->
          ContentPart.image!(base64_image, media: media, detail: "auto")
      end)

    Message.new_user!(parts)
  end

  defp langchain_message_from_chat_message(%{role: "tool"} = message) do
    Message.new_tool_result!(%{
      tool_results:
        message.tool_results
        |> Enum.map(
          &ToolResult.new!(%{
            name: &1.tool_name,
            content: &1.content,
            tool_call_id: &1.call_id
          })
        )
    })
  end

  defp langchain_message_from_chat_message(%{role: "tool_call"} = message) do
    Message.new_assistant!(%{
      tool_calls:
        message.tool_calls
        |> Enum.map(
          &ToolCall.new!(%{
            name: &1.tool_name,
            arguments: &1.arguments,
            call_id: &1.call_id
          })
        )
    })
  end

  @spec on_llm_token_usage((any() -> any()), String.t(), String.t()) :: (any(), any() -> any())
  defp on_llm_token_usage(on_cost, model, endpoint) do
    fn _model, usage ->
      token_summary = %Buildel.Langchain.ChatTokenSummary{
        input_tokens: usage.input,
        output_tokens: usage.output,
        model: model,
        endpoint: endpoint
      }

      on_cost.(token_summary)
    end
  end

  @spec on_llm_new_delta(fun()) :: fun()
  defp on_llm_new_delta(on_content) do
    fn _model, delta ->
      case delta do
        %LangChain.MessageDelta{status: :incomplete, content: content, tool_calls: nil}
        when is_binary(content) ->
          on_content.(content)

        _ ->
          nil
      end
    end
  end

  defp get_llm(%{api_type: "mistral"} = opts, callbacks) do
    ChatMistralAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      endpoint: opts.endpoint <> "/chat/completions",
      json_response: opts.response_format == "json",
      callbacks: callbacks,
      max_tokens: opts.max_tokens
    })
  end

  defp get_llm(%{api_type: "anthropic"} = opts, callbacks) do
    ChatAnthropic.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      endpoint: opts.endpoint <> "/messages",
      callbacks: callbacks,
      max_tokens: opts.max_tokens
    })
  end

  defp get_llm(%{api_type: "openai"} = opts, callbacks) do
    ChatOpenAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      endpoint: opts.endpoint <> "/chat/completions",
      json_response: opts.response_format == "json",
      stream_options: %{include_usage: true},
      callbacks: callbacks,
      max_tokens: opts.max_tokens
    })
  end

  defp get_llm(%{api_type: "azure"} = opts, callbacks) do
    ChatOpenAI.new!(%{
      model: opts.model,
      temperature: opts.temperature,
      stream: true,
      api_key: opts.api_key,
      endpoint: opts.endpoint <> "/chat/completions?api-version=2024-02-01",
      json_response: opts.response_format == "json",
      stream_options: %{include_usage: true},
      callbacks: callbacks,
      max_tokens: opts.max_tokens
    })
  end

  defp get_llm(%{api_type: "google"} = opts, callbacks) do
    ChatGoogleAI.new!(%{
      api_key: opts.api_key,
      model: opts.model,
      stream: true,
      temperature: opts.temperature,
      callbacks: callbacks
    })
  end
end
