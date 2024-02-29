defmodule BuildelWeb.Schemas.Blocks do
  alias OpenApiSpex.Schema

  defmodule CreateRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "BlockCreateRequest",
      type: :object,
      properties: %{
        block: %Schema{
          type: :object,
          properties: %{
            name: %Schema{type: :string, description: "Block name"},
            type: %Schema{type: :string, description: "Block type"},
            opts: %Schema{type: :object, description: "Block options"}
          },
          required: [:name, :type, :opts]
        }
      },
      required: [:block]
    })
  end
end
