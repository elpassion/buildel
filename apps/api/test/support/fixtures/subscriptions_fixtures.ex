defmodule Buildel.SubscriptionsFixtures do
  import Buildel.OrganizationsFixtures
  alias Buildel.Repo
  alias Buildel.Subscriptions

  def subscription_fixture(attrs \\ %{}) do
    organization =
      case attrs[:organization_id] do
        nil -> organization_fixture()
        _ -> Buildel.Organizations.get_organization!(attrs[:organization_id])
      end

    {:ok, features} = Subscriptions.Plan.get_features("free")

    params =
      attrs
      |> Enum.into(%{
        subscription_id: nil,
        customer_id: nil,
        start_date:
          NaiveDateTime.utc_now()
          |> DateTime.from_naive!("Etc/UTC")
          |> DateTime.truncate(:second),
        end_date:
          NaiveDateTime.utc_now()
          |> NaiveDateTime.add(30, :day)
          |> DateTime.from_naive!("Etc/UTC")
          |> DateTime.truncate(:second),
        type: "free",
        interval: "month",
        features: features,
        usage: %{
          runs_limit: 0
        },
        organization_id: organization.id
      })

    Subscriptions.Subscription.changeset(%Subscriptions.Subscription{}, params)
    |> Buildel.Repo.insert!()
  end

  def upgrade_subscription_to_plan(organization_id, plan) do
    {:ok, features} = Subscriptions.Plan.get_features(plan)

    subscription =
      Subscriptions.get_subscription_by_organization_id!(organization_id)

    subscription
    |> Subscriptions.Subscription.changeset(%{
      subscription_id: UUID.uuid4(),
      customer_id: UUID.uuid4(),
      type: plan,
      features: features
    })
    |> Buildel.Repo.update!()
  end

  def change_subscription_feature_limit(organization_id, feature, limit) do
    subscription = Subscriptions.get_subscription_by_organization_id(organization_id)
    features = subscription.features |> Map.put(feature, limit)

    subscription
    |> Subscriptions.Subscription.changeset(%{
      features: features
    })
    |> Buildel.Repo.update!()
  end

  def change_subscription_expiration_date(organization_id, date) do
    subscription = Subscriptions.get_subscription_by_organization_id(organization_id)

    subscription
    |> Subscriptions.Subscription.changeset(%{
      end_date: date
    })
    |> Buildel.Repo.update!()
  end
end
