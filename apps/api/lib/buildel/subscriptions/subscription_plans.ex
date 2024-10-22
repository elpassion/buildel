defmodule Buildel.Subscriptions.Plan do
  require Logger

  defstruct [
    :type,
    :status,
    :interval,
    :end_date,
    :customer_id,
    :features,
    :usage,
    :id,
    :organization_id
  ]

  @plan_features %{
    "free" => %{
      runs_limit: 1000,
      workflows_limit: 5,
      knowledge_bases_limit: 3,
      datasets_limit: 3,
      experiments_limit: 3,
      seats_limit: 1,
      el_included: false,
      dedicated_support: false
    },
    "starter" => %{
      runs_limit: 20000,
      workflows_limit: 10,
      knowledge_bases_limit: 5,
      datasets_limit: 5,
      experiments_limit: 5,
      seats_limit: 3,
      el_included: true,
      dedicated_support: false
    },
    "team" => %{
      runs_limit: 50000,
      workflows_limit: 30,
      knowledge_bases_limit: 15,
      datasets_limit: 15,
      experiments_limit: 15,
      seats_limit: 5,
      el_included: true,
      dedicated_support: true
    }
  }

  def get_features("free"), do: {:ok, @plan_features["free"]}
  def get_features("starter"), do: {:ok, @plan_features["starter"]}
  def get_features("team"), do: {:ok, @plan_features["team"]}
  def get_features(_), do: {:error, "Unknown plan"}

  def get_default_usage(),
    do: %{
      runs_limit: 0
    }

  def to_db(type, organization_id) do
    {:ok, features} = get_features(type)

    %{
      subscription_id: nil,
      customer_id: nil,
      organization_id: organization_id,
      start_date: NaiveDateTime.utc_now(),
      end_date:
        NaiveDateTime.utc_now()
        |> NaiveDateTime.add(30, :day),
      type: type,
      interval: "month",
      features: features,
      usage: get_default_usage()
    }
  end

  def from_db(%Buildel.Subscriptions.Subscription{} = subscription) do
    %__MODULE__{
      id: subscription.id,
      organization_id: subscription.organization_id,
      type: subscription.type,
      status: subscription |> Buildel.Subscriptions.Subscription.status(),
      interval: subscription.interval,
      end_date: subscription.end_date,
      customer_id: subscription.customer_id,
      features: subscription.features,
      usage: subscription.usage
    }
  end

  def get_feature_usage(organization_id, :runs_limit),
    do: Buildel.Subscriptions.get_feature_usage(organization_id, "runs_limit")

  def get_feature_usage(organization_id, :workflows_limit),
    do: {:ok, Buildel.Pipelines.count_organization_pipelines(organization_id)}

  def get_feature_usage(organization_id, :knowledge_bases_limit),
    do: {:ok, Buildel.Memories.count_organization_collections(organization_id)}

  def get_feature_usage(organization_id, :datasets_limit),
    do: {:ok, Buildel.Datasets.count_organization_datasets(organization_id)}

  def get_feature_usage(organization_id, :experiments_limit),
    do: {:ok, Buildel.Experiments.count_organization_experiments(organization_id)}

  def get_feature_usage(organization_id, :seats_limit),
    do: {:ok, Buildel.Organizations.count_organization_memberships(organization_id)}
end
