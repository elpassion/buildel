defmodule Buildel.Blocks.Utils.InputQueue do
  defstruct [:queue, :process_item]
  alias __MODULE__

  @type item :: any()
  @type queue :: [item()]
  @type process_item :: (item() -> any())
  @type t :: %InputQueue{queue: queue(), process_item: process_item()}

  @spec new(queue(), process_item()) :: t()
  def new(items, process_item) do
    %__MODULE__{queue: items, process_item: process_item}
  end

  @spec push(t(), item()) :: t()
  def push(%__MODULE__{queue: [], process_item: process_item}, item) do
    IO.puts("pushing first item")
    process_item.(item)

    %__MODULE__{queue: [item], process_item: process_item}
  end

  def push(%__MODULE__{queue: queue, process_item: process_item}, item) do
    IO.puts("pushing another item")

    %__MODULE__{queue: queue ++ [item], process_item: process_item}
  end

  @spec pop(t()) :: t()
  def pop(%__MODULE__{queue: [], process_item: process_item}) do
    IO.puts("removing from empty queue")
    %__MODULE__{queue: [], process_item: process_item}
  end

  @spec pop(t()) :: t()
  def pop(%__MODULE__{queue: [_item], process_item: process_item}) do
    IO.puts("removing last item")
    %__MODULE__{queue: [], process_item: process_item}
  end

  def pop(%__MODULE__{queue: [_item | [item]], process_item: process_item}) do
    IO.puts("removing another item")
    process_item.(item)

    %__MODULE__{queue: [item], process_item: process_item}
  end

  def pop(%__MODULE__{queue: [_item | [item | rest]], process_item: process_item}) do
    IO.puts("removing another item from queue")
    process_item.(item)

    %__MODULE__{queue: rest, process_item: process_item}
  end
end
