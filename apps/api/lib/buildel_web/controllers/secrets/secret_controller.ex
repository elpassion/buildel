defmodule BuildelWeb.SecretController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :index do
  end

  def index(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{}} <- validate(:index, params),
      {:ok, organization} <-
        Buildel.Organizations.get_user_organization(user, organization_id),
      secrets <-
        Buildel.Organizations.list_organization_secrets(organization) do
      render(conn, :index, secrets: secrets)
    end
  end

  defparams :create do
    required(:organization_id, :string)
    required(:name, :string)
    required(:value, :string)
  end

  def create(conn, %{"organization_id" => organization_id} = params) do
    user = conn.assigns.current_user

    with {:ok, params} <- validate(:create, params),
      {:ok, organization} <-
        Buildel.Organizations.get_user_organization(user, organization_id),
      {:ok, secret} <-
        Buildel.Organizations.create_organization_secret(organization, params) do
      conn
      |> put_status(:created)
      |> render(:show, secret: secret)
    end
  end

  def delete(conn, %{"organization_id" => organization_id, "name" => name}) do
    user = conn.assigns.current_user

    with {:ok, organization} <-
            Buildel.Organizations.get_user_organization(user, organization_id),
          :ok <- Buildel.Organizations.delete_organization_secret(organization, name) do
      conn |> put_status(:ok) |> json(%{})
    end
  end
end