defmodule Buildel.SubscriptionPlansTest do
  use Buildel.DataCase, async: true

  alias Buildel.Subscriptions

  describe "subscription_plans" do
    alias Buildel.Subscriptions.Plan

    import Buildel.OrganizationsFixtures

    test "get_features/1 returns the features of the free plan" do
      assert {:ok,
              %{
                runs_limit: 1000,
                workflows_limit: 5,
                knowledge_bases_limit: 3,
                datasets_limit: 3,
                experiments_limit: 3,
                seats_limit: 1,
                el_included: false,
                dedicated_support: false
              }} = Subscriptions.Plan.get_features("free")
    end

    test "get_features/1 returns the features of the starter plan" do
      assert {:ok,
              %{
                runs_limit: 20000,
                workflows_limit: 10,
                knowledge_bases_limit: 5,
                datasets_limit: 5,
                experiments_limit: 5,
                seats_limit: 3,
                el_included: true,
                dedicated_support: false
              }} = Subscriptions.Plan.get_features("starter")
    end

    test "get_features/1 returns the features of the team plan" do
      assert {:ok,
              %{
                runs_limit: 50000,
                workflows_limit: 30,
                knowledge_bases_limit: 15,
                datasets_limit: 15,
                experiments_limit: 15,
                seats_limit: 5,
                el_included: true,
                dedicated_support: true
              }} = Subscriptions.Plan.get_features("team")
    end

    test "get_features/1 returns error for unknown plan" do
      assert {:error, _} = Subscriptions.Plan.get_features("gigaplan")
    end

    test "get_default_usage/0 returns the default usage map" do
      assert %{
               runs_limit: 0
             } = Subscriptions.Plan.get_default_usage()
    end

    test "from_db/1 returns the plan struct" do
      organization = organization_fixture()
      subscription = Subscriptions.get_subscription_by_organization_id!(organization.id)

      assert %Plan{} = Plan.from_db(subscription)
    end

    test "get_feature_usage/2 returns error when feature usage not found" do
      organization = organization_fixture()

      assert {:error, :unknown_feature} =
               Plan.get_feature_usage(organization.id, :some_feature)
    end

    test "get_feature_usage/2 returns usage for runs_limit" do
      organization = organization_fixture()

      pipeline =
        Buildel.PipelinesFixtures.pipeline_fixture(%{
          organization_id: organization.id
        })

      Buildel.PipelinesFixtures.run_fixture(%{
        pipeline_id: pipeline.id
      })

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :runs_limit)
    end

    test "get_feature_usage/2 returns usage for workflows_limit" do
      organization = organization_fixture()

      Buildel.PipelinesFixtures.pipeline_fixture(%{
        organization_id: organization.id
      })

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :workflows_limit)
    end

    test "get_feature_usage/2 returns usage for knowledge_bases_limit" do
      organization = organization_fixture()

      Buildel.MemoriesFixtures.collection_fixture(%{
        organization_id: organization.id
      })

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :knowledge_bases_limit)
    end

    test "get_feature_usage/2 returns usage for datasets_limit" do
      organization = organization_fixture()

      Buildel.DatasetsFixtures.dataset_fixture(%{
        organization_id: organization.id
      })

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :datasets_limit)
    end

    test "get_feature_usage/2 returns usage for experiments_limit" do
      organization = organization_fixture()

      Buildel.ExperimentsFixtures.experiment_fixture(%{
        organization_id: organization.id
      })

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :experiments_limit)
    end

    test "get_feature_usage/2 returns usage for seats_limit" do
      organization = organization_fixture()

      assert {:ok, 1} =
               Plan.get_feature_usage(organization.id, :seats_limit)
    end
  end
end
