defmodule BuildelWeb.OrganizationToolChunkJSON do
  def show(%{chunks: chunks}) do
    %{data: Enum.map(chunks, &chunk/1)}
  end

  def chunk(chunk) do
    %{
      id: chunk.id,
      text: chunk.value,
      metadata:
        chunk.metadata
        |> Map.take([:parent, :next, :prev, :file_name, :keywords, :pages])
    }
  end
end
