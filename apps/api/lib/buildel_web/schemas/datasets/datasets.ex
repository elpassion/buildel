defmodule BuildelWeb.Schemas.Datasets do
  alias OpenApiSpex.Schema

  defmodule Dataset do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Dataset",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Dataset ID"},
        name: %Schema{type: :string, description: "Dataset name"}
      },
      required: [:id, :name]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: BuildelWeb.Schemas.Datasets.Dataset
        }
      },
      required: [:data]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetShowResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Datasets.Dataset
      },
      required: [:data]
    })
  end

  defmodule CreateDatasetRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetCreateRequest",
      type: :object,
      properties: %{
        dataset: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Dataset name"},
            file_id: %Schema{type: :string, description: "Dataset File ID"}
          },
          required: [:name]
        }
      },
      required: [:dataset]
    })
  end

  defmodule CreateDatasetResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "DatasetCreateResponse",
      type: :object,
      properties: %{
        data: BuildelWeb.Schemas.Datasets.Dataset
      },
      required: [:data]
    })
  end
end
