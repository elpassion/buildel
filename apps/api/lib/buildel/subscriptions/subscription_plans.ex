defmodule Buildel.Subscriptions.Plan do
  require Logger

  @application_features [
    runs_limit: 1000,
    workflows_limit: 5,
    knowledge_bases_limit: 3,
    datasets_limit: 3,
    experiments_limit: 1,
    seats_limit: 1,
    el_included: false,
    dedicated_support: false
  ]

  def from_db(%Buildel.Subscriptions.Subscription{} = subscription) do
    %{
      type: subscription.type,
      status: subscription |> Buildel.Subscriptions.Subscription.status(),
      interval: subscription.interval,
      end_date: subscription.end_date,
      customer_id: subscription.customer_id,
      features:
        Enum.reduce(@application_features, %{}, fn {feature, _}, acc ->
          acc |> Map.put(feature, subscription.features[to_string(feature)])
        end)
    }
  end

  def from_db(nil) do
    %{
      type: :free,
      status: :active,
      interval: :month,
      end_date: nil,
      customer_id: nil,
      features:
        Enum.reduce(@application_features, %{}, fn {feature, value}, acc ->
          acc |> Map.put(feature, value)
        end)
    }
  end

  def map_to_application_features(features, plan) do
    Enum.reduce(@application_features, %{}, fn {app_feature, _}, acc ->
      feature =
        Enum.find(features, fn feature ->
          feature["entitlement_feature"]["lookup_key"] == to_string(app_feature)
        end)

      map_feature(acc, feature, plan)
    end)
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "runs_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("runs_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "workflows_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("workflows_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "knowledge_bases_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("knowledge_bases_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "datasets_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("datasets_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "experiments_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("experiments_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "seats_limit",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("seats_limit", Map.get(metadata, plan, nil))
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "el_included",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("el_included", Map.get(metadata, plan, "false") == "true")
  end

  defp map_feature(
         acc,
         %{
           "entitlement_feature" => %{
             "lookup_key" => "dedicated_support",
             "metadata" => metadata
           }
         },
         plan
       ) do
    acc |> Map.put("dedicated_support", Map.get(metadata, plan, "false") == "true")
  end

  defp map_feature(acc, _, plan) do
    Logger.debug("Unhandled feature #{inspect(plan)}")
    acc
  end
end
