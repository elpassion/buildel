defmodule BuildelWeb.MemoryChunkPublicJSON do
  def index(%{chunks: chunks, pagination_params: pagination_params}) do
    %{
      data:
        for(chunk <- chunks, do: data(chunk))
        |> Enum.drop(pagination_params.page * pagination_params.per_page)
        |> Enum.take(pagination_params.per_page),
      meta: %{
        total: Enum.count(chunks),
        page: pagination_params.page,
        per_page: pagination_params.per_page
      }
    }
  end

  def show(%{chunk: chunk}) do
    %{
      data: data(chunk)
    }
  end

  defp data(%{} = chunk) do
    %{
      id: chunk["chunk_id"],
      content: chunk["document"],
      keywords: chunk["metadata"]["keywords"] || [],
      file_name: chunk["metadata"]["file_name"],
      pages: chunk["metadata"]["pages"]
    }
  end
end
