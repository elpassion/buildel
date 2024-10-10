defmodule BuildelWeb.Schemas.Subscriptions do
  alias OpenApiSpex.Schema

  defmodule Session do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionSession",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Checkout session ID"},
        customer: %Schema{type: :string, description: "Customer ID"},
        url: %Schema{type: :string, description: "Checkout session URL"}
      },
      required: [:id, :url]
    })
  end

  defmodule Price do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionPrice",
      type: :object,
      properties: %{
        id: %Schema{type: :string, description: "Price ID"},
        amount: %Schema{type: :number, description: "Price amount"},
        currency: %Schema{type: :string, description: "Price currency"},
        recurring: %Schema{
          type: :object,
          properties: %{
            interval: %Schema{type: :string, description: "Price interval"}
          },
          required: [:interval]
        }
      },
      required: [:id, :amount, :currency]
    })
  end

  defmodule Metadata do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionMetadata",
      type: :object,
      properties: %{
        recommended: %Schema{type: :boolean, description: "Metadata recommended status"}
      },
      required: [:recommended]
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
        prices: %Schema{
          type: :array,
          items: Price,
          description: "List of product prices"
        },
        metadata: Metadata,
        features: %Schema{
          type: :array,
          items: %Schema{
            type: :object,
            properties: %{
              name: %Schema{type: :string, description: "Feature name"}
            },
            required: [:name]
          },
          description: "List of product features"
        }
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

  defmodule CreateCheckoutSessionRequest do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionCreateCheckoutSessionRequest",
      type: :object,
      properties: %{
        price_id: %Schema{type: :string, description: "Price ID"}
      },
      required: [:price_id]
    })
  end

  defmodule CreateCheckoutSessionResponse do
    require OpenApiSpex

    OpenApiSpex.schema(%{
      title: "SubscriptionCreateCheckoutSessionResponse",
      type: :object,
      properties: %{
        data: Session
      },
      required: [:data]
    })
  end
end
