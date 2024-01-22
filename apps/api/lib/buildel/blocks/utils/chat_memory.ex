defmodule Buildel.Blocks.Utils.ChatMemory do
  defstruct [:messages, :initial_messages]

  def new(%{initial_messages: initial_messages}) do
    %__MODULE__{initial_messages: initial_messages, messages: initial_messages |> Enum.reverse()}
  end

  def get_messages(%__MODULE__{} = chat_memory) do
    chat_memory.messages |> Enum.reverse()
  end

  def add_message(%__MODULE__{messages: messages} = chat_memory, message) do
    %{chat_memory | messages: [message | messages]}
  end

  def add_user_message(%__MODULE__{} = chat_memory, %{content: content}) do
    add_message(chat_memory, %{role: "user", content: content})
  end
end

# add_message
# add_messages

# messages filled?
