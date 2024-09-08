defmodule BuildelWeb.OrganizationToolChunkJSON do
  def show(%{chunks: chunks}) do
    %{data: Enum.map(chunks, &chunk/1)}
  end

  def chunk(chunk) do
    metadata =
      chunk.metadata
      |> Map.take([:parent, :next, :prev, :from, :file_name, :keywords, :pages])

    metadata = metadata |> Map.put(:source, metadata.from) |> Map.delete(:from)

    %{
      id: chunk.id,
      text: chunk.value,
      metadata: metadata
    }
  end
end
