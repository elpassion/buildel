defmodule BuildelWeb.Schemas.Runs do
  alias OpenApiSpex.Schema

  defmodule RunConfig do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunConfig",
      type: :object,
      properties: %{
        blocks: %Schema{type: :array, description: "Blocks list", items: %Schema{type: :object}}
      },
      required: [:blocks]
    })
  end

  defmodule RunCost do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunCost",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Run cost ID"},
        amount: %Schema{type: :number, description: "Run cost amount"},
        input_tokens: %Schema{type: :number, description: "Input tokens amount"},
        output_tokens: %Schema{type: :number, description: "Output tokens amount"},
        description: %Schema{type: :string, description: "Run cost description"},
        created_at: %Schema{type: :string, description: "Run cost created at"}
      },
      required: [:id, :amount, :description, :created_at]
    })
  end

  defmodule ShowRunCostResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunCostShowResponse",
      type: :object,
      properties: %{
        data: RunCost
      },
      required: [:data]
    })
  end

  defmodule Run do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Run",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Run ID"},
        status: %Schema{
          description: "Run status",
          type: :string,
          enum: ["created", "running", "finished"]
        },
        created_at: %Schema{type: :string, description: "Created at"},
        config: RunConfig,
        costs: %Schema{
          type: :array,
          items: ShowRunCostResponse,
          description: "Run costs",
          nullable: true
        },
        total_cost: %Schema{type: :number, description: "Total run cost"}
      },
      required: [:id, :status, :created_at, :config, :costs]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunShowResponse",
      type: :object,
      properties: %{
        data: Run
      },
      required: [:data]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: Run, description: "Runs list"},
        meta: BuildelWeb.Schemas.Pagination.Meta
      },
      required: [:data, :meta]
    })
  end

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunCreateRequest",
      type: :object,
      properties: %{
        metadata: %Schema{type: :object, description: "Run metadata", default: %{}},
        alias: %Schema{type: :integer, description: "Run alias", default: 0}
      }
    })
  end

  defmodule InputRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunInputRequest",
      type: :object,
      properties: %{
        block_name: %Schema{type: :string, description: "Block name"},
        input_name: %Schema{type: :string, description: "Input name"},
        data: %Schema{type: :string, description: "Data"}
      },
      required: [:block_name, :input_name, :data]
    })
  end

  defmodule FileInputRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunFileInputRequest",
      type: :object,
      properties: %{
        block_name: %Schema{type: :string, description: "Block name"},
        input_name: %Schema{type: :string, description: "Input name"},
        file: %Schema{type: :string, description: "File", format: :binary}
      },
      required: [:block_name, :input_name, :file]
    })
  end

  defmodule FileInputRemoveRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunFileInputRemoveRequest",
      type: :object,
      properties: %{
        block_name: %Schema{type: :string, description: "Block name"},
        input_name: %Schema{type: :string, description: "Input name"},
        file_id: %Schema{type: :string, description: "File ID"}
      },
      required: [:block_name, :input_name, :file_id]
    })
  end

  defmodule StartRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "RunStartRequest",
      type: :object,
      properties: %{
        initial_inputs: %Schema{
          type: :array,
          description: "Blocks initial inputs",
          items: InputRequest,
          default: []
        }
      }
    })
  end
end
