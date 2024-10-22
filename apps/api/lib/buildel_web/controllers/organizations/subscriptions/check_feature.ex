defmodule BuildelWeb.Subscriptions.CheckFeature do
  import Plug.Conn
  import Phoenix.Controller

  alias Buildel.Subscriptions

  def init(default), do: default

  def call(%{params: %{"organization_id" => organization_id}} = conn, feature) do
    {:ok, plan} = Subscriptions.get_and_renew_organization_subscription_plan(organization_id)

    case Map.get(plan.features, to_string(feature)) do
      nil ->
        conn
        |> put_status(:forbidden)
        |> assign(:custom_message, "Feature #{feature} not found in your plan")
        |> put_view(BuildelWeb.ErrorJSON)
        |> render("billing_error.json")
        |> halt()

      feature_limit when is_integer(feature_limit) ->
        {:ok, current_usage} = Subscriptions.Plan.get_feature_usage(organization_id, feature)

        if current_usage < feature_limit do
          conn
        else
          conn
          |> put_status(:forbidden)
          |> assign(:custom_message, "Limit reached for #{feature}")
          |> put_view(BuildelWeb.ErrorJSON)
          |> render("billing_error.json")
          |> halt()
        end

      feature_enabled when is_boolean(feature_enabled) ->
        if feature_enabled do
          conn
        else
          conn
          |> put_status(:forbidden)
          |> assign(:custom_message, "Feature #{feature} is disabled in your plan")
          |> put_view(BuildelWeb.ErrorJSON)
          |> render("billing_error.json")
          |> halt()
        end

      _ ->
        conn
    end
  end
end
