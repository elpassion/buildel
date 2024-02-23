defmodule Buildel.Blocks.Utils.ChatCompletionMessageFormatter do
  def format_message_delta(message_delta, completion_id, model) do
    reason = finish_reason(message_delta)

    delta =
      case reason do
        "stop" -> %{}
        _ -> %{"content" => message_delta.content}
      end

    choices = [
      %{
        "finish_reason" => finish_reason(message_delta),
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

  def format_message(message, completion_id, model) do
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
      # TODO: Add usage
      "usage" => %{
        "completion_tokens" => 17,
        "prompt_tokens" => 57,
        "total_tokens" => 74
      }
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
      _ -> "other"
    end
  end
end
