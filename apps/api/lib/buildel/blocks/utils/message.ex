defmodule Buildel.Blocks.Utils.Message do
  @enforce_keys [:type, :message]
  defstruct [:type, :message, :topic, :metadata]

  @type type :: :text | :raw | :binary
  @type t :: %__MODULE__{
          type: type(),
          message: String.t(),
          topic: String.t() | nil,
          metadata: any() | nil
        }

  @spec new(type(), any()) :: %__MODULE__{}
  def new(type, message) do
    %__MODULE__{
      type: type,
      message: message,
      topic: nil,
      metadata: nil
    }
  end

  @spec set_topic(t(), String.t()) :: t()
  def set_topic(message, topic) do
    %__MODULE__{message | topic: topic}
  end

  @spec set_metadata(t(), any()) :: t()
  def set_metadata(message, metadata) do
    %__MODULE__{message | metadata: metadata}
  end
end
