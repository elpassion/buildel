defmodule BuildelWeb.Schemas.DatasetRows do
  alias OpenApiSpex.Schema

  defmodule DatasetRow do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetRow",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "ID"},
        index: %Schema{type: :integer, description: "Row Index"},
        data: %Schema{type: :any},
        created_at: %Schema{type: :string, description: "Created at"}
      },
      required: [
        :id,
        :index,
        :created_at,
        :data
      ]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetRowsIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: DatasetRow
        },
        meta: BuildelWeb.Schemas.Pagination.Meta
      },
      required: [:data]
    })
  end
end
