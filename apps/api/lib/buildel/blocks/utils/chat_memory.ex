defmodule Buildel.Blocks.Utils.ChatMemory do
  defstruct [:messages, :initial_messages]

  def new(%{initial_messages: initial_messages}) do
    %__MODULE__{initial_messages: initial_messages, messages: initial_messages |> Enum.reverse()}
  end

  def get_messages(%__MODULE__{} = chat_memory) do
    chat_memory.messages |> Enum.reverse()
  end

  def add_message(%__MODULE__{messages: existing_messages} = chat_memory, new_message) do
    %__MODULE__{chat_memory | messages: [new_message | existing_messages]}
  end

  def add_user_message(%__MODULE__{messages: [%{role: "user"} | _]} = chat_memory, %{
        content: content
      }) do
    if Enum.count(chat_memory.messages) == Enum.count(chat_memory.initial_messages) do
      add_message(chat_memory, %{role: "user", content: content})
    else
      chat_memory
    end
  end

  def add_user_message(%__MODULE__{} = chat_memory, %{content: content}) do
    add_message(chat_memory, %{role: "user", content: content})
  end

  def add_assistant_message(%__MODULE__{} = chat_memory, %{content: content}) do
    add_message(chat_memory, %{role: "assistant", content: content})
  end

  def add_tool_result_message(%__MODULE__{} = chat_memory, %{
        tool_name: tool_name,
        content: content
      }) do
    add_message(chat_memory, %{role: "tool", tool_name: tool_name, content: content})
  end

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

  def drop_first_non_initial_message(
        %__MODULE__{messages: messages, initial_messages: initial_messages} = chat_memory
      ) do
    initial_messages_length = Enum.count(initial_messages)

    if Enum.count(messages) == initial_messages_length do
      {:error, :initial_messages_too_long}
    else
      new_messages = chat_memory.messages |> List.delete_at(-(initial_messages_length + 1))
      {:ok, chat_memory |> Map.put(:messages, new_messages)}
    end
  end
end
