defmodule Buildel.Blocks.Utils.ChatCompletionMessageFormatter do
  def format_message_delta(message_delta, completion_id, model) do
    reason = finish_reason(message_delta)

    delta =
      case reason do
        "stop" ->
          %{
            "role" => "assistant"
          }

        _ ->
          %{"content" => message_delta.content}
      end

    delta =
      case message_delta.function_name do
        nil ->
          delta

        function_name ->
          %{
            "content" => "Calling: #{function_name} "
          }
      end

    delta =
      case message_delta.arguments do
        nil ->
          delta

        "" ->
          delta

        arguments ->
          %{
            "content" => arguments
          }
      end

    choices = [
      %{
        "finish_reason" => reason,
        "index" => message_delta.index,
        "delta" => delta,
        "logprobs" => nil
      }
    ]

    %{
      "id" => completion_id,
      "object" => "chat.completion.chunk",
      "created" => :os.system_time(:milli_seconds),
      "model" => model,
      "choices" => choices
    }
  end

  def format_message(message, completion_id, model, usage) do
    choices = [
      %{
        "finish_reason" => finish_reason(message),
        "index" => message.index,
        "message" => %{
          "content" => message.content,
          "role" => role(message)
        },
        "logprobs" => nil
      }
    ]

    %{
      "choices" => choices,
      "created" => :os.system_time(:milli_seconds),
      "id" => completion_id,
      "model" => model,
      "object" => "chat.completion",
      "usage" => usage(usage)
    }
  end

  defp finish_reason(message) do
    reason =
      case message.status do
        :complete -> "stop"
        :length -> "length"
        :incomplete -> nil
        _ -> nil
      end

    case message.role do
      :function_call -> "function_call"
      _ -> reason
    end
  end

  defp role(message) do
    case message.role do
      :function_call -> "function_call"
      :assistant -> "assistant"
      _ -> "other"
    end
  end

  defp usage(%Buildel.Langchain.TokenUsage{} = usage) do
    %{
      "completion_tokens" => usage.completion_tokens,
      "prompt_tokens" => usage.prompt_tokens,
      "total_tokens" => usage.total_tokens
    }
  end
end
