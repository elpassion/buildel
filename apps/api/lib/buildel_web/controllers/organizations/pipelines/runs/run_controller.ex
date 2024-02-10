defmodule BuildelWeb.OrganizationPipelineRunController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def index(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         runs <- Pipelines.list_pipeline_runs(pipeline) do
      render(conn, :index, runs: runs)
    end
  end

  def show(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id) do
      render(conn, :show, run: run)
    end
  end

  defparams :create do
    required(:organization_id, :string)
    required(:pipeline_id, :string)
    required(:metadata, :map)
    required(:alias, :integer)
  end

  @create_default_params %{
    "metadata" => %{},
    "alias" => 0
  }

  def create(conn, params) do
    params = Map.merge(@create_default_params, params)

    user = conn.assigns.current_user

    with {:ok,
          %{
            organization_id: organization_id,
            pipeline_id: pipeline_id,
            metadata: metadata,
            alias: alias
          }} <-
           validate(:create, params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, alias),
         {:ok, run} <-
           Pipelines.create_run(%{
             pipeline_id: pipeline_id,
             config: config |> Map.put(:metadata, metadata)
           }) do
      render(conn, :show, run: run)
    end
  end

  def start(conn, %{
        "organization_id" => organization_id,
        "pipeline_id" => pipeline_id,
        "id" => id
      }) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      render(conn, :show, run: run)
    end
  end

  def stop(conn, %{"organization_id" => organization_id, "pipeline_id" => pipeline_id, "id" => id}) do
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.stop_run(run) do
      render(conn, :show, run: run)
    end
  end

  defparams :input do
    required(:organization_id, :string)
    required(:pipeline_id, :string)
    required(:id, :string)
    required(:block_name, :string)
    required(:input_name, :string)
    required(:data, :string)
  end

  def input(conn, params) do
    user = conn.assigns.current_user

    with {:ok,
          %{
            organization_id: organization_id,
            pipeline_id: pipeline_id,
            id: id,
            block_name: block_name,
            input_name: input_name,
            data: data
          }} <- validate(:input, params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_running_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.cast_run(run, block_name, input_name, {:text, data}) do
      render(conn, :show, run: run)
    else
      {:error, :not_running} -> {:error, :bad_request}
      err -> err
    end
  end
end
