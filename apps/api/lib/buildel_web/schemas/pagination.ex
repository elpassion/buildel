defmodule BuildelWeb.Schemas.Pagination do
  alias OpenApiSpex.Schema

  defmodule Meta do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PaginationMeta",
      type: :object,
      properties: %{
        total: %Schema{type: :integer, description: "Total items"},
        page: %Schema{type: :integer, description: "Page number"},
        per_page: %Schema{type: :integer, description: "Items per page"}
      },
      required: [:total, :page, :per_page]
    })
  end

  defmodule CursorMeta do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "PaginationCursorMeta",
      type: :object,
      properties: %{
        before: %Schema{type: :string, description: "Cursor before", nullable: true},
        after: %Schema{type: :string, description: "Cursor after", nullable: true},
        total: %Schema{type: :integer, description: "Total items", nullable: true}
      }
    })
  end

  def cursor_params do
    [
      before: [in: :query, type: :string, description: "Cursor before", required: false],
      after: [in: :query, type: :string, description: "Cursor after", required: false],
      per_page: [
        in: :query,
        description: "Items per page",
        schema: %Schema{type: :integer, default: 10}
      ]
    ]
  end

  def default_params(defaults \\ %{}) do
    page = Map.get(defaults, :page, 0)
    per_page = Map.get(defaults, :per_page, 10)

    [
      search: [in: :query, type: :string, description: "Search text", required: false],
      page: [
        in: :query,
        description: "Page number",
        schema: %Schema{type: :integer, default: page}
      ],
      per_page: [
        in: :query,
        description: "Items per page",
        schema: %Schema{type: :integer, default: per_page}
      ]
    ]
  end
end
