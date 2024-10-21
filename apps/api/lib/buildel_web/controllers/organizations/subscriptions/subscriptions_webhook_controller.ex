defmodule BuildelWeb.OrganizationSubscriptionWebhookController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.SubscriptionsAuth

  require Logger
  alias Buildel.Subscriptions

  action_fallback(BuildelWeb.FallbackController)

  # plug(:verify_stripe_webhook)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug,
    replace_params: false

  tags ["subscriptions"]

  operation :webhook,
    summary: "Handle stripe webhook",
    parameters: [],
    request_body:
      {"session", "application/json", BuildelWeb.Schemas.Subscriptions.WebhookRequest},
    responses: [
      ok: {"success", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def webhook(conn, _params) do
    body = conn.body_params

    process_webhook(body)

    conn |> send_resp(200, "ok")
  end

  defp process_webhook(%{"type" => "checkout.session.completed", "data" => %{"object" => data}}) do
    Subscriptions.update_subscription(data, data["client_reference_id"])
  end

  defp process_webhook(%{"type" => "invoice.paid", "data" => %{"object" => data}}) do
    case Subscriptions.get_subscription_by_subscription_id(data["subscription"]) do
      nil ->
        Logger.debug(
          "Subscription not found for invoice.paid event, subscription_id: #{data["subscription"]}"
        )

        nil

      subscription ->
        Subscriptions.renew_subscription(subscription, data)
    end
  end

  defp process_webhook(%{"type" => "invoice.payment_failed", "data" => %{"object" => data}}) do
    subscription = Subscriptions.get_subscription_by_subscription_id!(data["subscription"])
    Subscriptions.cancel_subscription(subscription)
  end

  defp process_webhook(%{"type" => "customer.subscription.updated", "data" => %{"object" => data}}) do
    subscription = Subscriptions.get_subscription_by_subscription_id!(data["id"])

    case data["cancel_at_period_end"] do
      true ->
        Subscriptions.cancel_subscription(subscription)

      false ->
        Subscriptions.renew_subscription(subscription, %{
          "period_end" => data["current_period_end"]
        })
    end
  end

  defp process_webhook(%{"type" => type}) do
    Logger.debug("Unhandled webhook type #{type}")
  end
end
