defmodule BuildelWeb.MemoryJSON do
  alias Buildel.Memories.Memory

  def index(%{memories: memories, params: params, total: total}) do
    params =
      case params do
        %{page: nil, per_page: nil} ->
          %Buildel.Memories.ListParams{page: 1, per_page: total}

        params ->
          params
      end

    %{data: for(memory <- memories, do: data(memory)), meta: %{total: total, page: params.page, per_page: params.per_page}}
  end

  def show(%{memory: memory}) do
    %{data: data(memory)}
  end

  defp data(%Memory{} = memory) do
    %{
      id: memory.id,
      name: memory.file_name,
      file_name: memory.file_name,
      file_size: memory.file_size,
      file_type: memory.file_type,
      collection_name: memory.collection_name
    }
  end
end
