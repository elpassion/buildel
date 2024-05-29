defmodule BuildelWeb.Schemas.Collections do
  alias OpenApiSpex.Schema

  defmodule CollectionEmbedding do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionEmbedding",
      type: :object,
      properties: %{
        api_type: %Schema{type: :string, description: "API type"},
        model: %Schema{type: :string, description: "Model"},
        secret_name: %Schema{type: :string, description: "Secret name"},
        endpoint: %Schema{type: :string, description: "API Endpoint"}
      },
      required: [:api_type, :model, :secret_name, :endpoint]
    })
  end

  defmodule Collection do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Collection",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Collection ID"},
        name: %Schema{type: :string, description: "Collection name"},
        chunk_size: %Schema{type: :integer, description: "Chunk size"},
        chunk_overlap: %Schema{type: :integer, description: "Chunk overlap"},
        embeddings: CollectionEmbedding
      },
      required: [:id, :name, :chunk_size, :chunk_overlap]
    })
  end

  defmodule CollectionMemorySearchChunk do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionMemorySearchChunk",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Chunk ID"},
        content: %Schema{type: :string, description: "Content"},
        similarity: %Schema{type: :number, description: "Similarity score"},
        file_name: %Schema{type: :string, description: "File name"}
      },
      required: [:id, :content, :similarity, :file_name]
    })
  end

  defmodule SearchResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionSearchResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: CollectionMemorySearchChunk
        },
        meta: %Schema{
          type: :object,
          properties: %{
            total_tokens: %Schema{type: :integer, description: "Total tokens count"}
          },
          required: [:total_tokens]
        }
      },
      required: [:data]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Collection
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionShowResponse",
      type: :object,
      properties: %{
        data: Collection
      },
      required: [:data]
    })
  end

  defmodule CollectionEmbeddingCreate do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionEmbeddingCreate",
      type: :object,
      properties: %{
        api_type: %Schema{type: :string, description: "API type"},
        model: %Schema{type: :string, description: "Model"},
        secret_name: %Schema{type: :string, description: "Secret name"},
        endpoint: %Schema{type: :string, description: "Endpoint for model"}
      },
      required: [:api_type, :model, :secret_name, :endpoint]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionCreateRequest",
      type: :object,
      properties: %{
        collection_name: %Schema{type: :string, description: "Collection name"},
        embeddings: CollectionEmbeddingCreate,
        chunk_size: %Schema{type: :integer, description: "Chunk size"},
        chunk_overlap: %Schema{type: :integer, description: "Chunk overlap"}
      },
      required: [:collection_name, :embeddings]
    })
  end

  defmodule CollectionEmbeddingUpdate do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionEmbeddingUpdate",
      type: :object,
      properties: %{
        secret_name: %Schema{type: :string, description: "Secret name"}
      },
      required: [:secret_name]
    })
  end

  defmodule UpdateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionUpdateRequest",
      type: :object,
      properties: %{
        embeddings: CollectionEmbeddingUpdate
      },
      required: [:embeddings]
    })
  end
end
