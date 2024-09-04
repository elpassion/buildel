defmodule BuildelWeb.OrganizationToolEmbeddingsController do
  use BuildelWeb, :controller

  use OpenApiSpex.ControllerSpecs
  import BuildelWeb.UserAuth
  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["organization"]

  operation :create,
    summary: "Create embeddings",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body:
      {"embeddings", "application/json", BuildelWeb.Schemas.Embeddings.CreateEmbeddingsRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Embeddings.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params
    %{memory_collection_id: memory_collection_id, inputs: inputs} = conn.body_params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, memory_collection_id),
         {:ok, api_key} =
           Buildel.Organizations.get_organization_secret(
             organization,
             collection.embeddings_secret_name
           ),
         {:ok, embeddings} <-
           Buildel.Clients.Embeddings.new(%{
             api_type: collection.embeddings_api_type,
             model: collection.embeddings_model,
             api_key: api_key.value,
             endpoint: collection.embeddings_endpoint
           })
           |> Buildel.Clients.Embeddings.get_embeddings(inputs),
         cost_amount <-
           Buildel.Costs.CostCalculator.calculate_embeddings_cost(
             %Buildel.Langchain.EmbeddingsTokenSummary{
               tokens: embeddings.embeddings_tokens,
               model: collection.embeddings_model,
               endpoint: collection.embeddings_endpoint
             }
           ),
         {:ok, cost} <-
           Buildel.Organizations.create_organization_cost(
             organization,
             %{
               amount: cost_amount,
               input_tokens: embeddings.embeddings_tokens,
               output_tokens: 0
             }
           ),
         {:ok, _} <-
           Buildel.Memories.create_memory_collection_cost(collection, cost, %{
             cost_type: :query,
             description: "Api call for embeddings"
           }) do
      conn
      |> put_status(:created)
      |> render(:show, embeddings: embeddings)
    end
  end
end
