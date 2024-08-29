defmodule BuildelWeb.Schemas.Memories do
  alias OpenApiSpex.Schema

  defmodule Memory do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Memory",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Memory ID"},
        name: %Schema{type: :string, description: "Memory name"},
        file_name: %Schema{type: :string, description: "File name"},
        file_size: %Schema{type: :integer, description: "File size"},
        file_type: %Schema{type: :string, description: "File type"},
        collection_name: %Schema{type: :string, description: "Collection name"}
      },
      required: [:id, :name, :file_name, :file_size, :file_type, :collection_name]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Memory
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryShowResponse",
      type: :object,
      properties: %{
        data: Memory
      },
      required: [:data]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryCreateRequest",
      type: :object,
      properties: %{
        file_id: %Schema{type: :string, description: "File id"}
      },
      required: [:file_id]
    })
  end

  defmodule BulkDeleteRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "MemoryBulkDeleteRequest",
      type: :object,
      properties: %{
        ids: %Schema{type: :array, items: %Schema{type: :integer}, description: "Memory IDs"}
      },
      required: [:ids]
    })
  end
end
