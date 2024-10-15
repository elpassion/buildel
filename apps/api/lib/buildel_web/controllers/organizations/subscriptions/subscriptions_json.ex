defmodule BuildelWeb.OrganizationSubscriptionJSON do
  alias Buildel.Clients.Stripe

  def list_products(%{
        products: products
      }) do
    %{
      data: for(product <- products, do: product(product))
    }
  end

  def create(%{session: session}) do
    %{
      data: session(session)
    }
  end

  def create_portal_session(%{session: session}) do
    %{
      data: portal_session(session)
    }
  end

  def show(%{plan: plan}) do
    %{
      data: plan(plan)
    }
  end

  defp plan(plan) do
    %{
      status: plan.status,
      type: plan.type,
      interval: plan.interval,
      end_date: plan.end_date,
      customer_id: plan.customer_id,
      features: plan.features
    }
  end

  defp session(%Stripe.CheckoutSession{} = session) do
    %{
      session_id: session.id,
      customer_id: session.customer,
      url: session.url
    }
  end

  defp portal_session(%Stripe.PortalSession{} = session) do
    %{
      session_id: session.id,
      customer_id: session.customer,
      url: session.url
    }
  end

  defp product(%Stripe.Product{} = product) do
    %{
      id: product.id,
      name: product.name,
      description: product.description,
      active: product.active,
      features: features(product.features),
      prices: prices(product.prices),
      metadata: metadata(product.metadata)
    }
  end

  defp prices([]), do: []

  defp prices(prices) do
    Enum.map(prices, &price/1)
  end

  defp price(%Stripe.Price{recurring: recurring} = price) do
    %{
      id: price.id,
      currency: price.currency,
      amount: price.amount,
      recurring: recurring(recurring)
    }
  end

  defp recurring(nil), do: nil

  defp recurring(recurring) do
    %{
      interval: recurring.interval
    }
  end

  defp features(features) do
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
