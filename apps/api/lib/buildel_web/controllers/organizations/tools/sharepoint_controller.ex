defmodule BuildelWeb.OrganizationToolSharepointController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["sharepoint"]

  operation :list_sites,
    summary: "List sites",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      client_id: [
        in: :query,
        description: "Client ID",
        type: :string,
        required: true
      ],
      secret_name: [
        in: :query,
        description: "Client secret name",
        type: :string,
        required: true
      ],
      tenant_id: [
        in: :query,
        description: "Tenant ID",
        type: :string,
        required: true
      ]
    ],
    request_body: nil,
    responses: [
      ok: {"organizations", "application/json", BuildelWeb.Schemas.Sharepoint.ListSitesResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def list_sites(conn, _) do
    %{
      client_id: client_id,
      secret_name: secret_name,
      tenant_id: tenant_id,
      organization_id: organization_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %{value: client_secret}} <-
           Buildel.Organizations.get_organization_secret(organization, secret_name),
         {:ok, access_token} <- get_access_token(client_id, client_secret, tenant_id),
         {:ok, sites} <- get_sites(access_token) do
      render(conn, :list_sites, sites: sites["value"])
    end
  end

  operation :list_drives,
    summary: "List drives",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      client_id: [
        in: :query,
        description: "Client ID",
        type: :string,
        required: true
      ],
      secret_name: [
        in: :query,
        description: "Client secret name",
        type: :string,
        required: true
      ],
      tenant_id: [
        in: :query,
        description: "Tenant ID",
        type: :string,
        required: true
      ],
      site_id: [
        in: :query,
        description: "Site ID",
        type: :string,
        required: true
      ]
    ],
    request_body: nil,
    responses: [
      ok: {"organizations", "application/json", BuildelWeb.Schemas.Sharepoint.ListSitesResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def list_drives(conn, _) do
    %{
      client_id: client_id,
      secret_name: secret_name,
      tenant_id: tenant_id,
      organization_id: organization_id,
      site_id: site_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %{value: client_secret}} <-
           Buildel.Organizations.get_organization_secret(organization, secret_name),
         {:ok, access_token} <- get_access_token(client_id, client_secret, tenant_id),
         {:ok, drives} <- get_drives(access_token, site_id) do
      render(conn, :list_drives, drives: drives["value"])
    end
  end

  defp get_sites(access_token) do
    url =
      "https://graph.microsoft.com/v1.0/sites?search=*"

    headers = [
      {"Authorization", "Bearer #{access_token}"}
    ]

    case Req.new(url: url) |> Req.get(headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body}

      {:error, %Req.Response{body: reason}} ->
        {:ok, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_drives(access_token, site_id) do
    url =
      "https://graph.microsoft.com/v1.0/sites/#{site_id}/drives"

    headers = [
      {"Authorization", "Bearer #{access_token}"}
    ]

    case Req.new(url: url) |> Req.get(headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body}

      {:error, %Req.Response{body: reason}} ->
        {:ok, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end

  defp get_access_token(client_id, client_secret, tenant_id) do
    url = "https://login.microsoftonline.com/#{tenant_id}/oauth2/v2.0/token"

    body = %{
      "client_id" => client_id,
      "client_secret" => client_secret,
      "scope" => "https://graph.microsoft.com/.default",
      "grant_type" => "client_credentials"
    }

    headers = [{"Content-Type", "application/x-www-form-urlencoded"}]

    case Req.new(url: url) |> Req.post(form: body, headers: headers) do
      {:ok, %Req.Response{status: 200, body: body}} ->
        {:ok, body["access_token"]}

      {:ok, %Req.Response{body: reason}} ->
        {:error, reason}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
