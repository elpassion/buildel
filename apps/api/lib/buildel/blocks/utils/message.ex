defmodule Buildel.Blocks.Utils.Message do
  @enforce_keys [:type, :message]
  defstruct [:type, :message, :topic, :metadata]

  @type type :: :text | :raw | :binary | :json
  @type t :: %__MODULE__{
          type: type(),
          message: String.t(),
          topic: String.t() | nil,
          metadata: any() | nil
        }

  @spec new(type(), any()) :: %__MODULE__{}
  def new(type, message, metadata \\ %{}) do
    %__MODULE__{
      type: type,
      message: message,
      topic: nil,
      metadata: metadata
    }
  end

  @spec set_type(t(), type()) :: t()
  def set_type(message, type) do
    %__MODULE__{message | type: type}
  end

  @spec set_topic(t(), String.t()) :: t()
  def set_topic(message, topic) do
    %__MODULE__{message | topic: topic}
  end

  @spec set_metadata(t(), any()) :: t()
  def set_metadata(message, metadata) do
    %__MODULE__{message | metadata: metadata}
  end

  @spec set_message(t(), String.t()) :: t()
  def set_message(message, message_message) do
    %__MODULE__{message | message: message_message}
  end

  @spec block_name(t()) :: String.t() | nil
  def block_name(message) do
    case message.topic do
      nil -> nil
      topic -> io_from_topic(topic).block
    end
  end

  @spec input_or_output_name(t()) :: String.t() | nil
  def input_or_output_name(message) do
    case message.topic do
      nil -> nil
      topic -> io_from_topic(topic).io
    end
  end

  defp io_from_topic(topic) do
    case topic |> String.split("::") do
      ["context", context_id, "block", block_name, "io", output_name] ->
        %{
          context: context_id,
          block: block_name,
          io: output_name
        }

      ["context", context_id, "block", block_name] ->
        %{
          context: context_id,
          block: block_name,
          io: nil
        }
    end
  end

  defimpl Jason.Encoder, for: [__MODULE__] do
    alias Buildel.Blocks.Utils.Message

    def encode(%Message{type: :text} = message, opts) do
      Jason.Encode.string(message.message, opts)
    end

    def encode(%Message{type: :json} = message, opts) do
      Jason.Encode.value(message.message, opts)
    end
  end
end
