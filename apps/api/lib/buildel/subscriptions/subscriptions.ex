defmodule Buildel.Subscriptions do
  import Ecto.Query, warn: false

  alias Buildel.Repo
  alias Buildel.Subscriptions.Plan
  alias Buildel.Clients.Stripe
  alias Buildel.Subscriptions.Subscription

  def get_subscription_by_subscription_id!(id),
    do: Repo.get_by!(Subscription, subscription_id: id)

  def get_subscription_by_subscription_id(id), do: Repo.get_by(Subscription, subscription_id: id)

  def get_subscription_plan(organization_id) do
    subscription = Repo.one(from s in Subscription, where: s.organization_id == ^organization_id)

    {:ok, Plan.from_db(subscription)}
  end

  def create_subscription(attrs, organization_id) do
    with {:ok, %{body: body}} <- Stripe.get_subscription(attrs["subscription"]),
         product = List.first(body["items"]["data"]),
         {:ok, %{body: %{"name" => product_name}}} <-
           product["price"]["product"] |> Stripe.get_product(),
         {:ok, %{body: %{"data" => features}}} <-
           product["price"]["product"] |> Stripe.list_product_features() do
      features =
        Plan.map_to_application_features(features, String.downcase(product_name))

      attrs = %{
        subscription_id: attrs["subscription"],
        customer_id: attrs["customer"],
        start_date: body["current_period_start"] |> DateTime.from_unix!(),
        end_date: body["current_period_end"] |> DateTime.from_unix!(),
        type: String.downcase(product_name),
        interval: product["plan"]["interval"],
        features: features,
        organization_id: organization_id
      }

      %Subscription{} |> Subscription.changeset(attrs) |> Repo.insert()
    end
  end

  def renew_subscription(subscription, attrs) do
    subscription
    |> Subscription.changeset(%{
      cancel_at_period_end: false,
      end_date: attrs["period_end"] |> DateTime.from_unix!()
    })
    |> Repo.update()
  end

  def cancel_subscription(subscription) do
    subscription
    |> Subscription.changeset(%{cancel_at_period_end: true})
    |> Repo.update()
  end

  def get_status(%Subscription{} = subscription) do
    subscription |> Subscription.status()
  end
end
