defmodule Buildel.SubscriptionsFixtures do
  import Buildel.OrganizationsFixtures
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
          |> NaiveDateTime.add(31, :day)
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
end
