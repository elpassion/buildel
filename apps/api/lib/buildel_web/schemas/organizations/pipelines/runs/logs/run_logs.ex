defmodule BuildelWeb.Schemas.RunLogs do
  alias OpenApiSpex.Schema

  defmodule Log do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "Log",
      type: :object,
      properties: %{
        id: %Schema{type: :integer, description: "Log ID"},
        message: %Schema{type: :string, description: "Log message"},
        message_types: %Schema{
          type: :array,
          items: %Schema{type: :string},
          description: "Log message types"
        },
        raw_logs: %Schema{
          type: :array,
          items: %Schema{type: :integer},
          description: "Raw logs IDs"
        },
        block_name: %Schema{type: :string, description: "Block name"},
        context: %Schema{type: :string, description: "Log context"},
        created_at: %Schema{type: :string, description: "Created at"}
      },
      required: [:id, :message, :message_types, :raw_logs, :block_name, :context, :created_at]
    })
  end

  defmodule ShowResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "LogShowResponse",
      type: :object,
      properties: %{
        data: Log
      },
      required: [:data]
    })
  end

  defmodule IndexResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "LogIndexResponse",
      type: :object,
      properties: %{
        data: %Schema{type: :array, items: Log, description: "Logs list"}
      },
      required: [:data]
    })
  end
end
