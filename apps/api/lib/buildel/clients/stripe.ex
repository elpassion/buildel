defmodule Buildel.Clients.StripeBehaviour do
  @type list_products_params :: %{
          active: boolean()
        }

  @callback list_products(list_products_params()) ::
              {:ok, [Buildel.Clients.Stripe.Product.t()]} | {:error, term}
end

defmodule Buildel.Clients.Stripe do
  @behaviour Buildel.Clients.StripeBehaviour

  defmodule Price do
    @type t :: %__MODULE__{
            id: binary(),
            amount: integer(),
            currency: binary()
          }

    defstruct [:id, :currency, :amount]
  end

  defmodule Product do
    @type t :: %__MODULE__{
            id: binary(),
            name: binary(),
            description: binary(),
            active: boolean(),
            price: Price.t() | nil
          }

    defstruct [:id, :name, :description, :active, :price]
  end

  @impl Buildel.Clients.StripeBehaviour
  def list_products(attrs \\ %{}) do
    url = "/products?expand[]=data.default_price"

    url =
      Enum.reduce(Map.to_list(attrs), url, fn
        {:active, active}, url when is_boolean(active) ->
          "#{url}&active=#{active}"

        _, url ->
          url
      end)

    with {:ok, %Req.Response{body: body, status: 200}} <-
           request(url) do
      {:ok, body["data"] |> map_products()}
    end
  end

  def get_price(price_id) do
    request(price_id)
  end

  def new(options \\ []) when is_list(options) do
    Req.new(
      base_url: "https://api.stripe.com/v1",
      auth: {:bearer, Application.fetch_env!(:buildel, :stripe_api_key)}
    )
    |> Req.Request.append_request_steps(
      post: fn req ->
        with %{method: :get, body: <<_::binary>>} <- req do
          %{req | method: :post}
        end
      end
    )
    |> Req.merge(options)
  end

  def request(url, options \\ []), do: Req.request(new(url: parse_url(url)), options)

  def request!(url, options \\ []), do: Req.request!(new(url: parse_url(url)), options)

  defp parse_url("prod_" <> _ = id), do: "/products/#{id}"
  defp parse_url("price_" <> _ = id), do: "/prices/#{id}"
  defp parse_url("sub_" <> _ = id), do: "/subscriptions/#{id}"
  defp parse_url("cus_" <> _ = id), do: "/customers/#{id}"
  defp parse_url("cs_" <> _ = id), do: "/checkout/sessions/#{id}"
  defp parse_url("inv_" <> _ = id), do: "/invoices/#{id}"
  defp parse_url("evt_" <> _ = id), do: "/events/#{id}"
  defp parse_url(url) when is_binary(url), do: url

  defp map_products(products) do
    Enum.map(products, fn %{
                            "id" => id,
                            "name" => name,
                            "description" => description,
                            "active" => active,
                            "default_price" => price
                          } ->
      %Product{
        id: id,
        name: name,
        description: description,
        active: active,
        price: map_price(price)
      }
    end)
  end

  defp map_price(nil), do: nil

  defp map_price(%{
         "id" => id,
         "currency" => currency,
         "unit_amount" => amount
       }) do
    %Price{
      id: id,
      currency: currency,
      amount: amount
    }
  end
end
