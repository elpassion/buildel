defmodule Buildel.Clients.StripeBehaviour do
  @type list_products_params :: %{
          active: boolean()
        }

  @type create_checkout_session_params :: %{
          price_id: binary(),
          organization_id: binary(),
          customer_id: binary()
        }

  @callback list_products(list_products_params()) ::
              {:ok, [Buildel.Clients.Stripe.Product.t()]} | {:error, term}
  @callback create_checkout_session(create_checkout_session_params()) ::
              {:ok, Buildel.Clients.Stripe.Session.t()} | {:error, term}
end

defmodule Buildel.Clients.Stripe do
  @behaviour Buildel.Clients.StripeBehaviour

  defmodule Price do
    @type recurring :: %{
            interval: binary()
          }

    @type t :: %__MODULE__{
            id: binary(),
            amount: integer(),
            currency: binary(),
            recurring: recurring() | nil
          }

    defstruct [:id, :currency, :amount, :recurring]
  end

  defmodule Metadata do
    @type t :: %__MODULE__{
            recommended: boolean()
          }

    defstruct [:recommended]
  end

  defmodule Feature do
    @type t :: %__MODULE__{
            name: binary()
          }

    defstruct [:name]
  end

  defmodule Product do
    @type t :: %__MODULE__{
            id: binary(),
            name: binary(),
            description: binary(),
            active: boolean(),
            prices: [Price.t()] | nil,
            features: [Feature.t()],
            metadata: Metadata.t() | nil
          }

    defstruct [:id, :name, :description, :active, :prices, :features, :metadata]
  end

  defmodule Session do
    @type t :: %__MODULE__{
            id: binary(),
            customer: binary() | nil,
            url: binary()
          }

    defstruct [:id, :customer, :url]
  end

  @impl Buildel.Clients.StripeBehaviour
  def create_checkout_session(%{
        price_id: price_id,
        customer_id: _customer_id,
        organization_id: organization_id
      }) do
    url = "/checkout/sessions"

    body = %{
      "client_reference_id" => organization_id,
      "line_items[0][price]" => price_id,
      "line_items[0][quantity]" => 1,
      "mode" => "subscription",
      "success_url" =>
        Application.get_env(:buildel, :page_url) <>
          "/#{organization_id}/settings/billing?result=success&session_id={CHECKOUT_SESSION_ID}'",
      "cancel_url" =>
        Application.get_env(:buildel, :page_url) <>
          "/#{organization_id}/settings/billing?result=cancel"
    }

    with {:ok, %Req.Response{body: session, status: 200}} <-
           request(url, form: body) do
      {:ok, map_session(session)}
    else
      {:ok, %Req.Response{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, reason}

      e ->
        e
    end
  end

  def get_subscription("sub_" <> id) do
    request("sub_#{id}")
  end

  def get_customer(id) do
    request(id)
  end

  def get_product("prod_" <> id) do
    request("prod_#{id}")
  end

  def create_customer(email) do
    request("/customers", form: %{"email" => email})
  end

  def list_product_features(product_id) do
    request("#{product_id}/features")
  end

  @impl Buildel.Clients.StripeBehaviour
  def list_products(attrs \\ %{}) do
    url = "/products?"

    url =
      Enum.reduce(Map.to_list(attrs), url, fn
        {:active, active}, url when is_boolean(active) ->
          "#{url}&active=#{active}"

        _, url ->
          url
      end)

    with {:ok, %Req.Response{body: products, status: 200}} <-
           request(url),
         {:ok, %Req.Response{body: prices, status: 200}} <-
           request("/prices") do
      {:ok, map_products(products["data"], prices["data"])}
    else
      {:ok, %Req.Response{status: 404}} ->
        {:error, :not_found}

      {:error, reason} ->
        {:error, reason}

      e ->
        e
    end
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

  defp map_session(%{"id" => id, "customer" => customer, "url" => url}) do
    %Session{id: id, customer: customer, url: url}
  end

  defp map_products(products, prices) do
    Enum.map(products, fn %{
                            "id" => id,
                            "name" => name,
                            "description" => description,
                            "active" => active,
                            "features" => features,
                            "metadata" => metadata
                          } ->
      %Product{
        id: id,
        name: name,
        description: description,
        active: active,
        features: map_features(features),
        prices: map_prices(id, prices),
        metadata: map_metadata(metadata)
      }
    end)
  end

  defp map_prices(product_id, prices) do
    prices =
      Enum.filter(prices, fn
        %{"product" => ^product_id} -> true
        _ -> false
      end)

    Enum.map(prices, &map_price/1)
  end

  defp map_price(nil), do: nil

  defp map_price(%{
         "id" => id,
         "currency" => currency,
         "unit_amount" => amount,
         "recurring" => recurring
       }) do
    %Price{id: id, currency: currency, amount: amount, recurring: map_recurring(recurring)}
  end

  defp map_recurring(nil), do: nil

  defp map_recurring(%{"interval" => interval}), do: %{interval: interval}

  defp map_features(features) do
    Enum.map(features, fn %{"name" => name} ->
      %Feature{name: name}
    end)
  end

  defp map_metadata(nil), do: nil

  defp map_metadata(%{"recommended" => recommended}) do
    %Metadata{recommended: !!recommended}
  end

  defp map_metadata(%{}), do: %Metadata{recommended: false}
end
