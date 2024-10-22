defmodule Buildel.SubscriptionsTest do
  use Buildel.DataCase, async: true

  alias Buildel.Subscriptions

  describe "subscriptions" do
    alias Buildel.Subscriptions.Subscription
    alias Buildel.Subscriptions.Plan

    import Buildel.OrganizationsFixtures
    import Buildel.SubscriptionsFixtures

    test "get_and_renew_organization_subscription_plan/1 returns the organization subscription plan" do
      organization = organization_fixture()

      assert {:ok, %Plan{} = _plan} =
               Subscriptions.get_and_renew_organization_subscription_plan(organization.id)
    end

    test "get_and_renew_organization_subscription_plan/1 renews local free subscription if it's expired" do
      organization = organization_fixture()
      old_date = DateTime.utc_now() |> DateTime.add(-1, :day)

      subscription =
        change_subscription_expiration_date(
          organization.id,
          old_date
        )

      assert subscription.end_date < DateTime.utc_now()

      assert {:ok, plan} =
               Subscriptions.get_and_renew_organization_subscription_plan(organization.id)

      assert DateTime.after?(plan.end_date, DateTime.utc_now())
    end

    test "get_and_renew_organization_subscription_plan/1 does not renew subscription if it's not expired" do
      organization = organization_fixture()
      old_date = DateTime.utc_now() |> DateTime.add(1, :day)

      change_subscription_expiration_date(
        organization.id,
        old_date
      )

      assert {:ok, plan} =
               Subscriptions.get_and_renew_organization_subscription_plan(organization.id)

      assert DateTime.to_unix(plan.end_date) == DateTime.to_unix(old_date)
    end

    test "get_and_renew_organization_subscription_plan/1 does not renew subscription if it's not free plan" do
      organization = organization_fixture()
      old_date = DateTime.utc_now() |> DateTime.add(-1, :day)

      upgrade_subscription_to_plan(organization.id, "starter")

      change_subscription_expiration_date(
        organization.id,
        old_date
      )

      assert {:ok, plan} =
               Subscriptions.get_and_renew_organization_subscription_plan(organization.id)

      assert DateTime.to_unix(plan.end_date) == DateTime.to_unix(old_date)
    end

    test "get_subscription_by_organization_id!/1 returns the subscription with given organization id" do
      organization = organization_fixture()

      assert %Subscription{} =
               Subscriptions.get_subscription_by_organization_id!(organization.id)
    end

    test "get_subscription_by_organization_id!/1 throws error when no subscription found" do
      assert_raise Ecto.NoResultsError, fn ->
        Subscriptions.get_subscription_by_organization_id!(1)
      end
    end

    test "get_subscription_by_organization_id/1 returns the subscription with given organization id" do
      organization = organization_fixture()

      assert %Subscription{} =
               Subscriptions.get_subscription_by_organization_id(organization.id)
    end

    test "get_subscription_by_organization_id/1 returns nil when no subscription found" do
      assert Subscriptions.get_subscription_by_organization_id(1) == nil
    end

    test "get_subscription_by_subscription_id!/1 returns the subscription with given subscription id" do
      organization = organization_fixture()
      subscription = upgrade_subscription_to_plan(organization.id, "free")

      assert %Subscription{} =
               Subscriptions.get_subscription_by_subscription_id!(subscription.subscription_id)
    end

    test "get_subscription_by_subscription_id!/1 throws error when no subscription found" do
      assert_raise Ecto.NoResultsError, fn ->
        Subscriptions.get_subscription_by_subscription_id!("1")
      end
    end

    test "get_subscription_by_subscription_id/1 returns the subscription with given subscription id" do
      organization = organization_fixture()
      subscription = upgrade_subscription_to_plan(organization.id, "free")

      assert %Subscription{} =
               Subscriptions.get_subscription_by_subscription_id(subscription.subscription_id)
    end

    test "get_subscription_by_subscription_id/1 returns nil when no subscription found" do
      assert Subscriptions.get_subscription_by_subscription_id("1") == nil
    end

    test "get_feature_usage/2 returns error when feature usage not found" do
      organization = organization_fixture()

      assert {:error, :feature_usage_not_found} =
               Subscriptions.get_feature_usage(organization.id, :unknown_feature)
    end

    test "get_feature_usage/2 returns the runs_limit usage" do
      organization = organization_fixture()

      assert {:ok, 0} = Subscriptions.get_feature_usage(organization.id, "runs_limit")
    end

    test "renew_subscription/2 renews the stripe subscription and resets usage" do
      organization = organization_fixture()
      subscription = upgrade_subscription_to_plan(organization.id, "free")

      date = DateTime.utc_now() |> DateTime.to_unix()

      attrs = %{
        "period_end" => date
      }

      assert {:ok, %Subscription{} = subscription} =
               Subscriptions.renew_subscription(subscription, attrs)

      assert subscription.end_date == date |> DateTime.from_unix!()
      assert subscription.usage == Plan.get_default_usage()
      assert subscription.cancel_at_period_end == false
    end

    test "cancel_subscription/1 cancels the stripe subscription" do
      organization = organization_fixture()
      subscription = upgrade_subscription_to_plan(organization.id, "free")

      assert {:ok, %Subscription{} = subscription} =
               Subscriptions.cancel_subscription(subscription)

      assert subscription.cancel_at_period_end == true
    end

    test "get_status/1 returns the proper status" do
      organization = organization_fixture()
      subscription = upgrade_subscription_to_plan(organization.id, "free")

      assert %Subscription{} = subscription
      assert Subscriptions.get_status(subscription) == :active

      {:ok, subscription} = subscription |> Subscriptions.cancel_subscription()

      assert Subscriptions.get_status(subscription) == :canceled

      {:ok, subscription} =
        subscription
        |> Subscriptions.renew_subscription(%{
          "period_end" =>
            DateTime.utc_now()
            |> DateTime.to_unix()
            |> Kernel.-(10000)
        })

      assert Subscriptions.get_status(subscription) == :expired
    end
  end
end
