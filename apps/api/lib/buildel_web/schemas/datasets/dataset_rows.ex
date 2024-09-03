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

  defmodule CreateDatasetRowRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetCreateRowRequest",
      type: :object,
      properties: %{
        data: %Schema{
          type: :object,
          description: "Data to be inserted into the dataset",
          additionalProperties: true,
          properties: %{}
        }
      },
      required: [:data]
    })
  end

  defmodule CreateDatasetRowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetCreateRowResponse",
      type: :object,
      properties: %{
        data: DatasetRow
      },
      required: [:data]
    })
  end


  defmodule BulkDeleteRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetRowBulkDeleteRequest",
      type: :object,
      properties: %{
        ids: %Schema{type: :array, items: %Schema{type: :integer}, description: "Row IDs"}
      },
      required: [:ids]
    })
  end
end
