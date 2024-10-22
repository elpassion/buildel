defmodule Buildel.Subscriptions do
  import Ecto.Query, warn: false

  alias Buildel.Repo
  alias Buildel.Subscriptions.Plan
  alias Buildel.Clients.Stripe
  alias Buildel.Subscriptions.Subscription

  def get_and_renew_organization_subscription_plan(organization_id) do
    subscription = get_subscription_by_organization_id!(organization_id)

    case {subscription |> Subscription.status(), subscription.subscription_id, subscription.type} do
      {:expired, nil, "free"} ->
        {:ok, subscription} =
          renew_subscription(subscription, %{
            "period_end" =>
              subscription.end_date
              |> DateTime.add(30, :day)
              |> DateTime.to_unix()
          })

        {:ok, subscription |> Plan.from_db()}

      _ ->
        {:ok, Plan.from_db(subscription)}
    end
  end

  def get_subscription_by_organization_id!(id),
    do: Repo.get_by!(Subscription, organization_id: id)

  def get_subscription_by_organization_id(id), do: Repo.get_by(Subscription, organization_id: id)

  def get_subscription_by_subscription_id!(id),
    do: Repo.get_by!(Subscription, subscription_id: id)

  def get_subscription_by_subscription_id(id), do: Repo.get_by(Subscription, subscription_id: id)

  def get_feature_usage(organization_id, feature) do
    subscription =
      Repo.one(from s in Subscription, where: s.organization_id == ^organization_id)
      |> Plan.from_db()

    case Map.get(subscription.usage, feature) do
      nil -> {:error, :feature_usage_not_found}
      value -> {:ok, value}
    end
  end

  def update_subscription(attrs, organization_id) do
    with {:ok, subscription} <- get_subscription_by_organization_id!(organization_id),
         {:ok, %{body: body}} <- Stripe.get_subscription(attrs["subscription"]),
         product = List.first(body["items"]["data"]),
         {:ok, %{body: %{"name" => product_name}}} <-
           product["price"]["product"] |> Stripe.get_product(),
         {:ok, features} <- Plan.get_features(String.downcase(product_name)) do
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

      subscription |> Subscription.changeset(attrs) |> Repo.update()
    end
  end

  def renew_subscription(subscription, attrs) do
    subscription
    |> Subscription.changeset(%{
      cancel_at_period_end: false,
      end_date: attrs["period_end"] |> DateTime.from_unix!(),
      usage: Plan.get_default_usage()
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
