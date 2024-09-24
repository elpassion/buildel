defmodule Buildel.Blocks.Utils.Message do
  @enforce_keys [:id, :type, :message, :sent?, :parents]
  defstruct [:id, :type, :message, :topic, :metadata, :sent?, :parents]

  @type type :: :text | :raw | :binary | :json
  @type t :: %__MODULE__{
          id: String.t(),
          type: type(),
          message: String.t(),
          topic: String.t() | nil,
          metadata: any() | nil,
          parents: [String.t()],
          sent?: boolean()
        }

  @spec new(type(), any()) :: %__MODULE__{}
  def new(type, message, metadata \\ %{}) do
    %__MODULE__{
      id: UUID.uuid4(),
      type: type,
      message: message,
      topic: nil,
      parents: [],
      metadata: metadata,
      sent?: false
    }
  end

  @spec from_message(t()) :: t()
  def from_message(message) do
    %{message | parents: message.parents ++ [message.id], id: UUID.uuid4(), sent?: false}
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

  @spec set_message(t(), any()) :: t()
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

  @spec set_sent(t()) :: t()
  def set_sent(message) do
    %{message | sent?: true}
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

  def to_string(%__MODULE__{type: :text, message: message}), do: {:ok, message}
  def to_string(%__MODULE__{type: :json, message: message}), do: Jason.encode(message)

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
