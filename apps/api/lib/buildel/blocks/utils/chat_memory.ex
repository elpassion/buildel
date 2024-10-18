defmodule Buildel.Blocks.Utils.ChatMemory do
  defstruct [:messages, :initial_messages, :type]

  def new(%{initial_messages: initial_messages, type: type}) do
    %__MODULE__{
      initial_messages: initial_messages,
      messages: initial_messages |> Enum.reverse(),
      type: type
    }
  end

  def get_messages(%__MODULE__{} = chat_memory) do
    chat_memory.messages |> Enum.reverse()
  end

  def add_message(%__MODULE__{type: :off} = chat_memory, _message), do: chat_memory

  def add_message(module, %{role: "user"} = message), do: add_user_message(module, message)

  def add_message(module, %{role: "assistant"} = message),
    do: add_assistant_chunk(module, message)

  def add_user_message(%__MODULE__{type: :off} = chat_memory, _message), do: chat_memory

  def add_user_message(%__MODULE__{messages: [%{role: "user"} | _]} = chat_memory, %{
        content: content
      }) do
    if Enum.count(chat_memory.messages) == Enum.count(chat_memory.initial_messages) do
      do_add_message(chat_memory, %{role: "user", content: content})
    else
      chat_memory
    end
  end

  def add_user_message(%__MODULE__{} = chat_memory, %{content: content}) do
    do_add_message(chat_memory, %{role: "user", content: content})
  end

  def add_assistant_message(%__MODULE__{} = chat_memory, %{content: content}) do
    do_add_message(chat_memory, %{role: "assistant", content: content})
  end

  def add_tool_calls_message(%__MODULE__{type: :off} = chat_memory, _calls), do: chat_memory

  def add_tool_calls_message(%__MODULE__{} = chat_memory, %{
        tool_calls: tool_calls
      }) do
    do_add_message(chat_memory, %{
      role: "tool_call",
      content: nil,
      tool_calls:
        tool_calls
        |> Enum.map(fn tool_call ->
          %{
            tool_name: tool_call.name,
            arguments: tool_call.arguments,
            call_id: tool_call.call_id,
            content: nil
          }
        end)
    })
  end

  def add_tool_results_message(%__MODULE__{type: :off} = chat_memory, _results), do: chat_memory

  def add_tool_results_message(%__MODULE__{} = chat_memory, %{
        tool_results: tool_results
      }) do
    do_add_message(chat_memory, %{
      role: "tool",
      content: nil,
      tool_results:
        tool_results
        |> Enum.map(fn tool_result ->
          %{
            tool_name: tool_result.name,
            call_id: tool_result.tool_call_id,
            content: tool_result.content
          }
        end)
    })
  end

  def add_assistant_chunk(%__MODULE__{type: :off} = chat_memory, _chunk), do: chat_memory

  def add_assistant_chunk(
        %__MODULE__{messages: [%{role: "assistant", content: content} | other_messages]} =
          chat_memory,
        chunk
      ) do
    if Enum.count(chat_memory.messages) == Enum.count(chat_memory.initial_messages) do
      add_assistant_message(chat_memory, %{content: chunk})
    else
      new_messages = [
        %{role: "assistant", content: (content <> chunk) |> String.replace("\n", " ")}
        | other_messages
      ]

      chat_memory |> Map.put(:messages, new_messages)
    end
  end

  def add_assistant_chunk(%__MODULE__{} = chat_memory, chunk) do
    add_assistant_message(chat_memory, %{content: chunk})
  end

  def reset(%__MODULE__{} = chat_memory) do
    %__MODULE__{chat_memory | messages: chat_memory.initial_messages |> Enum.reverse()}
  end

  def drop_first_non_initial_message(
        %__MODULE__{messages: messages, initial_messages: initial_messages, type: :rolling} =
          chat_memory
      ) do
    initial_messages_length = Enum.count(initial_messages)

    if Enum.count(messages) == initial_messages_length do
      {:error, :initial_messages_too_long}
    else
      new_messages = chat_memory.messages |> List.delete_at(-(initial_messages_length + 1))
      {:ok, chat_memory |> Map.put(:messages, new_messages)}
    end
  end

  def drop_first_non_initial_message(%__MODULE__{}) do
    {:error, :full_chat_memory}
  end

  defp do_add_message(%__MODULE__{messages: existing_messages} = chat_memory, new_message) do
    %__MODULE__{chat_memory | messages: [new_message | existing_messages]}
  end
end
