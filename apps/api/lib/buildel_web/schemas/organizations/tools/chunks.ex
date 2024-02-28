defmodule BuildelWeb.Schemas.Chunks do
  alias OpenApiSpex.Schema

  defmodule Chunk do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Chunk",
      type: :object,
      properties: %{
        text: %Schema{type: :string, description: "Chunk text"}
      },
      required: [:text]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ChunkShowResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Chunks.Chunk
        }
      },
      required: [:data]
    })
  end

  defmodule CreateChunkRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "ChunkCreateRequest",
      type: :object,
      properties: %{
        file: %Schema{type: :string, description: "File", format: :binary},
        chunk_size: %Schema{type: :integer, description: "Chunk size", default: 1000},
        chunk_overlap: %Schema{type: :integer, description: "Chunk overlap", default: 250}
      },
      required: [:file]
    })
  end
end
