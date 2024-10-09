defmodule BuildelWeb.OrganizationSubscriptionJSON do
  alias Buildel.Clients.Stripe

  def list_products(%{
        products: products
      }) do
    %{
      data: for(product <- products, do: product(product))
    }
  end

  defp product(%Stripe.Product{} = product) do
    %{
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      features: features(product.features),
      price: price(product.price),
      metadata: metadata(product.metadata)
    }
  end

  defp price(nil), do: nil

  defp price(%Stripe.Price{} = price) do
    %{
      id: price.id,
      amount: price.amount,
      currency: price.currency
    }
  end

  defp features(features)do
    for %Stripe.Feature{name: name} <- features do
      %{name: name}
    end
  end

  defp metadata(%Stripe.Metadata{} = metadata) do
    %{
      recommended: metadata.recommended
    }
  end
end
