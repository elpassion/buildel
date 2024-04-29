defmodule BuildelWeb.Schemas.CollectionCosts do
  alias OpenApiSpex.Schema

  defmodule CollectionCost do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionCost",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Cost ID"},
        amount: %Schema{type: :number, description: "Cost amount"},
        input_tokens: %Schema{type: :number, description: "Input tokens amount"},
        output_tokens: %Schema{type: :number, description: "Output tokens amount"},
        description: %Schema{type: :string, description: "Collection cost description"},
        cost_type: %Schema{
          description: "Collection cost type",
          type: :string,
          enum: ["file_upload", "query"]
        },
        created_at: %Schema{type: :string, description: "Collection cost created at"}
      },
      required: [
        :id,
        :amount,
        :input_tokens,
        :output_tokens,
        :description,
        :cost_type,
        :created_at
      ]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "CollectionCostsIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: CollectionCost
        },
        meta: BuildelWeb.Schemas.Pagination.Meta
      },
      required: [:data]
    })
  end
end
