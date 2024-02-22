defmodule BuildelWeb.MemoryChunkJSON do
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

  defp data(%{} = chunk) do
    %{
      id: chunk["metadata"]["chunk_id"],
      content: chunk["document"]
    }
  end
end
