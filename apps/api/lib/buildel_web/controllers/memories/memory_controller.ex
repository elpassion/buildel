defmodule BuildelWeb.MemoryController do
  import BuildelWeb.UserAuth
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :create do
    required(:files, {:array, :map})
    required(:collection_name, :string)
  end

  def create(conn, %{ "organization_id" => organization_id } = params) do
    user = conn.assigns.current_user

    with {:ok, %{files: _files}} <- validate(:create, params),
      {:ok, _organization} <- Buildel.Organizations.get_user_organization(user, organization_id) do

      conn
      |> put_status(:created)
      |> json(%{})
    end
  end
end
