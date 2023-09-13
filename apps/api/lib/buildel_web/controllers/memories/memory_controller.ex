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

  def create(conn, params) do
    with {:ok, %{files: files}} <- validate(:create, params) do

      conn
      |> put_status(:created)
      |> json(%{})
    end
  end
end
