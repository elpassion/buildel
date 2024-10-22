defmodule BuildelWeb.Subscriptions.CheckFeature do
  import Plug.Conn
  import Phoenix.Controller

  alias Buildel.Subscriptions

  def init(default), do: default

  defp check_feature(organization_id, feature) do
    {:ok, plan} = Subscriptions.get_and_renew_organization_subscription_plan(organization_id)

    case Map.get(plan.features, to_string(feature)) do
      nil ->
        {:error, "Feature #{feature} not found in your plan"}

      feature_limit when is_integer(feature_limit) ->
        {:ok, current_usage} = Subscriptions.Plan.get_feature_usage(organization_id, feature)

        if current_usage < feature_limit do
          {:ok, nil}
        else
          {:error, "Limit reached for #{feature}"}
        end

      feature_enabled when is_boolean(feature_enabled) ->
        if feature_enabled do
          {:ok, nil}
        else
          {:error, "Feature #{feature} is disabled in your plan"}
        end
    end
  end

  def call(%{params: %{"organization_id" => organization_id}} = conn, feature) do
    case check_feature(organization_id, feature) do
      {:ok, _} ->
        conn

      {:error, message} ->
        conn
        |> put_status(:forbidden)
        |> assign(:custom_message, message)
        |> put_view(BuildelWeb.ErrorJSON)
        |> render("billing_error.json")
        |> halt()
    end
  end

  def call(organization_id, feature) do
    check_feature(organization_id, feature)
  end
end
