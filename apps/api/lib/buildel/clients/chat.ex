defmodule Buildel.Clients.ChatBehaviour do
  @callback stream_chat(%{
              context: map(),
              on_content: any(),
              on_tool_content: any(),
              on_tool_call: any(),
              on_cost: any(),
              on_end: any(),
              on_error: any(),
              api_key: String.t(),
              model: String.t(),
              temperature: number(),
              tools: list(any()),
              messages: list(map()),
              max_tokens: any()
            }) :: :ok
end

defmodule Buildel.Clients.Chat do
  require Logger
  alias LangChain.Message.ContentPart
  alias LangChain.Message.ToolResult
  alias LangChain.Message.ToolCall
  alias Buildel.Clients.ChatBehaviour
  alias Langchain.ChatModels.ChatMistralAI
  alias LangChain.ChatModels.ChatOpenAI
  alias LangChain.ChatModels.ChatGoogleAI
  alias LangChain.ChatModels.ChatAnthropic
  alias LangChain.Message
  alias LangChain.Chains.LLMChain

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
          on_cost: on_cost,
          model: model,
          tools: tools
        } = opts
      ) do
    opts =
      opts
      |> Map.put_new(:on_message, fn _ -> nil end)
      |> Map.put_new(:api_type, "openai")
      |> Map.put_new(:endpoint, "https://api.openai.com/v1")
      |> Map.put_new(:response_format, "text")

    handler = %{
      on_llm_new_delta: fn _model, delta ->
        case delta do
          %LangChain.MessageDelta{status: :incomplete, content: content, tool_calls: nil}
          when is_binary(content) ->
            on_content.(content)

          _ ->
            nil
        end
      end,
      on_llm_token_usage: fn _model, usage ->
        token_summary = %Buildel.Langchain.ChatTokenSummary{
          input_tokens: usage.input,
          output_tokens: usage.output,
          model: model,
          endpoint: opts.endpoint
        }

        on_cost.(token_summary)
      end
    }

    llm = get_llm(opts, [handler])

    messages =
      context.messages
      |> Enum.map(fn
        %{role: "assistant"} = message ->
          Message.new_assistant!(message.content)

        %{role: "system"} = message ->
          Message.new_system!(message.content)

        %{role: "user", content: content} when is_binary(content) ->
          Message.new_user!(content)

        %{role: "user", content: content_list} ->
          parts =
            content_list
            |> Enum.map(fn
              %{type: :text, content: content} ->
                ContentPart.text!(content)

              %{type: :image, content: base64_image, media: media} ->
                ContentPart.image!(base64_image, media: media, detail: "auto")
            end)

          Message.new_user!(parts)

        %{role: "tool"} = message ->
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

        %{role: "tool_call"} = message ->
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
      end)

    with {:ok, chain, message} <-
           LLMChain.new!(%{
             llm: llm,
             custom_context: context
           })
           |> LLMChain.add_tools(tools |> Enum.map(& &1.function))
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
               on_tool_content.(message.tool_results)
             end,
             on_message_processed: fn _chain, message ->
               if Message.is_tool_call?(message) do
                 on_tool_call.(message.tool_calls)
               end
             end
           })
           |> LLMChain.run(mode: :while_needs_response) do
      on_end.()

      {:ok, chain, message}
    else
      {:error, _chain, reason} ->
        if String.contains?(reason, "maximum context length") do
          on_error.(:context_length_exceeded)
          {:error, :context_length_exceeded}
        else
          on_error.(reason)
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

  def get_models(_) do
    []
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
