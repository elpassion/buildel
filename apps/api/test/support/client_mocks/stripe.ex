defmodule Buildel.ClientMocks.Stripe do
  @behaviour Buildel.Clients.StripeBehaviour

  @impl Buildel.Clients.StripeBehaviour
  def list_products(attrs \\ %{}) do
    {:ok,
     [
       %Buildel.Clients.Stripe.Product{
         id: "prod_1",
         name: "Product 1",
         description: "Description 1",
         active: true,
         price: %Buildel.Clients.Stripe.Price{
           id: "price_1",
           currency: "usd",
           amount: 1000
         }
       },
       %Buildel.Clients.Stripe.Product{
         id: "prod_2",
         name: "Product 2",
         description: "Description 2",
         active: true,
         price: %Buildel.Clients.Stripe.Price{
           id: "price_2",
           currency: "usd",
           amount: 2000
         }
       }
     ]}
  end
end
