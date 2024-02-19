defmodule BuildelWeb.OrganizationPipelineChatCompletionController do
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def create(conn, %{"organization_id" => organization_id, "pipeline" => pipeline_params}) do
    conn
    |> put_status(201)
    |> render("show.json", completion: %{})
  end
end
