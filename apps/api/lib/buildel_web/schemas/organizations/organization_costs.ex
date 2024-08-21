defmodule BuildelWeb.Schemas.OrganizationCosts do
  alias OpenApiSpex.Schema

  defmodule Cost do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "OrganizationCost",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Cost ID"},
        amount: %Schema{type: :number, description: "Cost amount"},
        input_tokens: %Schema{type: :integer, description: "Input tokens"},
        output_tokens: %Schema{type: :integer, description: "Output tokens"},
        created_at: %Schema{type: :string, description: "Cost creation date"},
        description: %Schema{type: :string, description: "Cost description"},
        type: %Schema{type: :string, description: "Cost type"},
        run_id: %Schema{type: :integer, description: "Run ID", nullable: true},
        memory_collection_id: %Schema{
          type: :integer,
          description: "Memory collection ID",
          nullable: true
        }
      },
      required: [
        :id,
        :amount,
        :input_tokens,
        :output_tokens,
        :created_at,
        :description,
        :type,
        :run_id,
        :memory_collection_id
      ]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "OrganizationCostsIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Cost
        },
        meta: BuildelWeb.Schemas.Pagination.Meta
      },
      required: [:data, :meta]
    })
  end
end
