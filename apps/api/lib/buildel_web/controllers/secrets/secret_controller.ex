defmodule BuildelWeb.SecretController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["secret"]

  operation :index,
    summary: "List user organization secrets",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"secrets", "application/json", BuildelWeb.Schemas.Secrets.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         secrets <-
           Buildel.Organizations.list_organization_secrets(organization) do
      render(conn, :index, secrets: secrets)
    end
  end

  operation :show,
    summary: "Get user organization secret",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      name: [in: :path, description: "Secret name", type: :string, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"secrets", "application/json", BuildelWeb.Schemas.Secrets.IndexResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{organization_id: organization_id, name: name} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, secret} <-
           Buildel.Organizations.get_organization_secret(organization, name) do
      render(conn, :show, secret: secret)
    end
  end

  operation :create,
    summary: "Creates a secret",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: {"secret", "application/json", BuildelWeb.Schemas.Secrets.CreateSecretRequest},
    responses: [
      created: {"secrets", "application/json", BuildelWeb.Schemas.Secrets.ShowResponse},
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
    user = conn.assigns.current_user

    params = %{
      organization_id: conn.params.organization_id,
      name: conn.body_params.name,
      value: conn.body_params.value
    }

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, secret} <-
           Buildel.Organizations.create_organization_secret(organization, params) do
      conn
      |> put_status(:created)
      |> render(:show, secret: secret)
    end
  end

  operation :delete,
    summary: "Deletes a secret",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      name: [in: :path, description: "Secret name", type: :string, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"secrets", "application/json", nil},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, _params) do
    %{organization_id: organization_id, name: name} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, _} <- Buildel.Organizations.delete_organization_secret(organization, name) do
      conn |> put_status(:ok) |> json(%{})
    end
  end

  operation :update,
    summary: "Updates a secret",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      name: [in: :path, description: "Secret name", type: :string, required: true]
    ],
    request_body: {"secret", "application/json", BuildelWeb.Schemas.Secrets.UpdateSecretRequest},
    responses: [
      created: {"secrets", "application/json", BuildelWeb.Schemas.Secrets.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _params) do
    %{organization_id: organization_id, name: name} = conn.params
    user = conn.assigns.current_user

    params = %{
      organization_id: organization_id,
      name: name,
      value: conn.body_params.value
    }

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, secret} <-
           Buildel.Organizations.update_organization_secret(organization, params) do
      conn
      |> put_status(:ok)
      |> render(:show, secret: secret)
    end
  end
end
