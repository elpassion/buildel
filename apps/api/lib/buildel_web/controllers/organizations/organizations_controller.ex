defmodule BuildelWeb.OrganizationController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  tags ["organization"]

  operation :index,
    summary: "List organizations",
    parameters: [],
    request_body: nil,
    responses: [
      ok: {"organizations", "application/json", BuildelWeb.Schemas.Organizations.IndexResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def index(conn, _) do
    organizations = conn.assigns.current_user |> Organizations.list_user_organizations()
    render(conn, :index, organizations: organizations)
  end

  operation :show,
    summary: "Get organization",
    parameters: [
      id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok: {"organization", "application/json", BuildelWeb.Schemas.Organizations.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def show(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {organization_id, _} when is_number(organization_id) <- Integer.parse(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id) do
      render(conn, :show, organization: organization)
    end
  end

  operation :create,
    summary: "Create organization",
    parameters: [],
    request_body:
      {"organization", "application/json", BuildelWeb.Schemas.Organizations.CreateRequest},
    responses: [
      created:
        {"organization", "application/json", BuildelWeb.Schemas.Organizations.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  defparams :create do
    required(:organization, :map) do
      required(:name, :string)
    end
  end

  def create(conn, params) do
    with {:ok, %{organization: organization_params}} <- validate(:create, params),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.create_organization(
             organization_params
             |> Map.put(:user_id, conn.assigns.current_user.id)
           ) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
      |> render(:show, organization: organization)
    end
  end

  operation :update,
    summary: "Update organization",
    parameters: [
      id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body:
      {"organization", "application/json", BuildelWeb.Schemas.Organizations.CreateRequest},
    responses: [
      ok: {"organization", "application/json", BuildelWeb.Schemas.Organizations.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  defparams :update do
    required(:organization, :map) do
      required(:name, :string)
    end
  end

  def update(conn, %{"id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{organization: organization_params}} <- validate(:update, params),
         {:ok, organization_id} <- Buildel.Utils.parse_id(organization_id),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Organizations.Organization{} = organization} <-
           Organizations.update_organization(organization, organization_params) do
      conn
      |> put_status(:ok)
      |> put_resp_header("location", ~p"/api/organizations/#{organization.id}")
      |> render(:show, organization: organization)
    end
  end

  operation :get_api_key,
    summary: "Get organization API key",
    parameters: [
      id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok:
        {"organization_key", "application/json",
         BuildelWeb.Schemas.Organizations.ShowApiKeyResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def get_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end

  operation :reset_api_key,
    summary: "Reset organization API key",
    parameters: [
      id: [in: :path, description: "Organization ID", type: :integer]
    ],
    request_body: nil,
    responses: [
      ok:
        {"organization_key", "application/json",
         BuildelWeb.Schemas.Organizations.ShowApiKeyResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def reset_api_key(conn, %{"id" => organization_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id),
         {:ok, organization} <- Organizations.reset_organization_api_key(organization) do
      render(conn, :organization_key, key: organization.api_key, hidden: true)
    end
  end
end
