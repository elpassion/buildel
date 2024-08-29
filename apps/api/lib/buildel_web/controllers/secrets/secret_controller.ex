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

  operation :aliases,
    summary: "List secrets provider aliases",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"secrets", "application/json", BuildelWeb.Schemas.Secrets.AliasResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def aliases(conn, _params) do
    %{organization_id: organization_id} = conn.params
    user = conn.assigns.current_user

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         aliases <-
           Buildel.Secrets.Aliases.aliases() do
      render(conn, :aliases, aliases: aliases)
    end
  end

  operation :index,
    summary: "List user organization secrets",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      include_aliases: [
        in: :query,
        description: "Should endpoint return secret aliases",
        type: :boolean,
        required: false
      ]
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
      render(conn, :index, secrets: secrets, include_aliases: conn.params[:include_aliases])
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

    with {:ok, alias} <- verify_alias(conn.body_params.alias),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, secret} <-
           Buildel.Organizations.create_organization_secret(
             organization,
             params |> Map.put(:alias, alias)
           ) do
      conn
      |> put_status(:created)
      |> render(:show, secret: secret)
    else
      {:error, :alias_not_found} ->
        {:error,
         changeset_for_errors(%{
           alias: "Alias not found"
         })}

      e ->
        e
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
      name: name
    }

    params =
      case conn.body_params.value do
        nil -> params
        value -> Map.put(params, :value, value)
      end

    with {:ok, alias} <- verify_alias(conn.body_params.alias),
         {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, secret} <-
           Buildel.Organizations.update_organization_secret(
             organization,
             params |> Map.put(:alias, alias)
           ) do
      conn
      |> put_status(:ok)
      |> render(:show, secret: secret)
    else
      {:error, :alias_not_found} ->
        {:error,
         changeset_for_errors(%{
           alias: "Alias not found"
         })}

      e ->
        e
    end
  end

  defp verify_alias(nil), do: {:ok, nil}
  defp verify_alias(""), do: {:ok, nil}

  defp verify_alias(alias) do
    case Buildel.Secrets.Aliases.aliases() |> Enum.member?(String.to_atom(alias)) do
      true -> {:ok, alias}
      false -> {:error, :alias_not_found}
    end
  end

  defp changeset_for_errors(errors) do
    %Ecto.Changeset{
      action: :validate,
      errors:
        errors
        |> Enum.map(fn {key, value} -> {key, {value, []}} end)
        |> Enum.into(%{}),
      changes: %{},
      types: %{}
    }
  end
end
