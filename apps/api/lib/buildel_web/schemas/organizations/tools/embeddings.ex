defmodule BuildelWeb.Schemas.Embeddings do
  alias OpenApiSpex.Schema

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "EmbeddingsShowResponse",
      type: :object,
      properties: %{
        embeddings: %Schema{
          type: :array,
          items: %Schema{type: :array, items: %Schema{type: :number}}
        },
        embeddings_tokens: %Schema{type: :number}
      },
      required: [:embeddings, :embeddings_tokens]
    })
  end

  defmodule CreateEmbeddingsRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "EmbeddingsCreateRequest",
      type: :object,
      properties: %{
        inputs: %Schema{
          type: :array,
          items: %Schema{type: :string, description: "Chunk text"}
        },
        memory_collection_id: %Schema{type: :number, description: "Memory collection id"}
      },
      required: [:inputs, :memory_collection_id]
    })
  end
end
