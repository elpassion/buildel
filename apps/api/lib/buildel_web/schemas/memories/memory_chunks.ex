defmodule BuildelWeb.Schemas.MemoryChunks do
  alias OpenApiSpex.Schema

  defmodule MemoryChunk do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryChunk",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Memory chunk ID"},
        content: %Schema{type: :string, description: "Memory chunk content"}
      },
      required: [:id, :content]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryChunkIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: MemoryChunk, description: "Memory chunk list"},
        meta: BuildelWeb.Schemas.Pagination.Meta
      },
      required: [:data, :meta]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryChunkShowResponse",
      type: :object,
      properties: %{
        data: MemoryChunk
      },
      required: [:data]
    })
  end
end
