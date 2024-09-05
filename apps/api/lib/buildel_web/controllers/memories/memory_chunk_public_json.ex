defmodule BuildelWeb.MemoryChunkPublicJSON do
  def show(%{chunk: chunk}) do
    %{
      data: data(chunk)
    }
  end

  defp data(%{} = chunk) do
    %{
      id: chunk["chunk_id"],
      content: chunk["document"],
      keywords: chunk["metadata"]["keywords"] || []
    }
  end
end
