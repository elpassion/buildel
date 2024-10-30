defmodule BuildelWeb.OrganizationSubscriptionController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Clients.Stripe

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug,
    replace_params: false

  tags ["subscriptions"]

  operation :list_products,
    summary: "List products",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Subscriptions.ListProductsResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def list_products(conn, _params) do
    %{"organization_id" => organization_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, _organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, products} <-
           Stripe.list_products(%{
             active: true
           }) do
      render(conn, :list_products, products: products)
    end
  end
end
