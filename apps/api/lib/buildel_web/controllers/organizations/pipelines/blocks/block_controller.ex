defmodule BuildelWeb.OrganizationPipelineBlockController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams(:create) do
    required(:block, :map) do
      required(:name, :string)
      required(:type, :string)
      required(:opts, :map)
      optional(:connections, :list, default: [])
      optional(:inputs, :list, default: [])
    end
  end

  def create(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = params) do
    user = conn.assigns.current_user

    with {:ok, %{block: block_config}} <-
           validate(:create, params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.create_block(
             pipeline,
             Map.merge(block_config, %{connections: [], inputs: []})
           ) do
      conn
      |> put_status(:created)
      |> json(%{})
    end
  end
end
