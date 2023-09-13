defmodule BuildelWeb.ChannelAuthController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator
  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback BuildelWeb.FallbackController

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :create do
    required(:channel_name, :string, format: ~r/pipelines:\d+:\d+/)
    required(:socket_id, :string)
  end

  def create(conn, params) do
    user = conn.assigns.current_user

    with {:ok, %{channel_name: "pipelines:" <> organization_pipeline_id, socket_id: socket_id}} <- validate(:create, params),
         [organization_id, pipeline_id] <- String.split(organization_pipeline_id, ":"),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <- Pipelines.get_organization_pipeline(organization, pipeline_id) do
      conn
      |> put_status(200)
      |> json(%{})
    else
      {:error, :not_found} ->
        {:error, :unauthorized}
      err -> err
    end
  end
end
