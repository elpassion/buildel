defmodule Buildel.ClientMocks.Stripe do
  @behaviour Buildel.Clients.StripeBehaviour

  @impl Buildel.Clients.StripeBehaviour
  def create_checkout_session(_attrs \\ %{}) do
    {:ok,
     %Buildel.Clients.Stripe.CheckoutSession{
       id: "session_1",
       customer: "customer_1",
       url: "http://example.com"
     }}
  end

  @impl Buildel.Clients.StripeBehaviour
  def list_products(_attrs \\ %{}) do
    {:ok,
     [
       %Buildel.Clients.Stripe.Product{
         id: "prod_1",
         name: "Product 1",
         description: "Description 1",
         active: true,
         prices: [
           %Buildel.Clients.Stripe.Price{
             id: "price_1",
             currency: "usd",
             amount: 1000,
             recurring: %{
               interval: "month"
             }
           }
         ]
       },
       %Buildel.Clients.Stripe.Product{
         id: "prod_2",
         name: "Product 2",
         description: "Description 2",
         active: true,
         prices: [
           %Buildel.Clients.Stripe.Price{
             id: "price_2",
             currency: "usd",
             amount: 2000,
             recurring: %{
               interval: "month"
             }
           }
         ]
       }
     ]}
  end
end
