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

  def default_params do
    [
      search: [in: :query, type: :string, description: "Search text", required: false],
      page: [in: :query, description: "Page number", schema: %Schema{type: :integer, default: 0}],
      per_page: [
        in: :query,
        description: "Items per page",
        schema: %Schema{type: :integer, default: 10}
      ]
    ]
  end
end
