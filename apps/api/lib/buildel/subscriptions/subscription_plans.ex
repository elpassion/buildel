defmodule Buildel.Subscriptions.Plan do
  require Logger

  @application_features [
    :runs_limit,
    :workflows_limit,
    :knowledge_bases_limit,
    :datasets_limit,
    :experiments_limit,
    :seats_limit,
    :el_included,
    :dedicated_support
  ]

  def map_to_application_features(features, plan) do
    Enum.reduce(@application_features, %{}, fn app_feature, acc ->
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
