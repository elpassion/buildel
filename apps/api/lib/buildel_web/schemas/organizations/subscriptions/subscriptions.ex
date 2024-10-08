defmodule BuildelWeb.Schemas.Subscriptions do
  alias OpenApiSpex.Schema

  defmodule Price do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionPrice",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Price ID"},
        amount: %Schema{type: :number, description: "Price amount"},
        currency: %Schema{type: :string, description: "Price currency"}
      },
      required: [:id, :amount, :currency]
    })
  end

  defmodule Product do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionProduct",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Product ID"},
        name: %Schema{type: :string, description: "Product name"},
        description: %Schema{type: :string, description: "Product description"},
        active: %Schema{type: :boolean, description: "Product active status"},
        price: Price
      },
      required: [:id, :name, :description, :active]
    })
  end

  defmodule ListProductsResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionListProductsResponse",
      type: :object,
      properties: %{
        data: %Schema{
          type: :array,
          items: Product
        }
      },
      required: [:data]
    })
  end
end
