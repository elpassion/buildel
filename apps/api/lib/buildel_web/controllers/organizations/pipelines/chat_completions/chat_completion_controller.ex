defmodule BuildelWeb.OrganizationPipelineChatCompletionController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def create(conn, %{"organization_id" => organization_id, "pipeline_id" => _pipeline_id}) do
    current_user = conn.assigns[:current_user]

    with {:ok, organization} <- Organizations.get_user_organization(current_user, organization_id) do
      conn
      |> put_status(201)
      |> render("show.json", completion: %{})
    end
  end
end
