defmodule BuildelWeb.MemoryJSON do
  alias Buildel.Memories.Memory

  def index(%{memories: memories}) do
    %{data: for(memory <- memories, do: data(memory))}
  end

  def show(%{memory: memory}) do
    %{data: data(memory)}
  end

  defp data(%Memory{} = memory) do
    %{
      id: memory.id,
      file_name: memory.file_name,
      file_size: memory.file_size,
      file_type: memory.file_type,
      collection_name: memory.collection_name
    }
  end
end
