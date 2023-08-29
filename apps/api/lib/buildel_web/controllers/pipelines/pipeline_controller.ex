defmodule BuildelWeb.PipelineController do
  use BuildelWeb, :controller

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  action_fallback BuildelWeb.FallbackController

  def index(conn, _params) do
    pipelines = Pipelines.list_pipelines()
    render(conn, :index, pipelines: pipelines)
  end

  def create(conn, %{"pipeline" => pipeline_params}) do
    with {:ok, %Pipeline{} = pipeline} <- Pipelines.create_pipeline(pipeline_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/pipelines/#{pipeline}")
      |> render(:show, pipeline: pipeline)
    end
  end

  def show(conn, %{"id" => id}) do
    pipeline = Pipelines.get_pipeline!(id)
    render(conn, :show, pipeline: pipeline)
  end

  def update(conn, %{"id" => id, "pipeline" => pipeline_params}) do
    pipeline = Pipelines.get_pipeline!(id)

    with {:ok, %Pipeline{} = pipeline} <- Pipelines.update_pipeline(pipeline, pipeline_params) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  def delete(conn, %{"id" => id}) do
    pipeline = Pipelines.get_pipeline!(id)

    with {:ok, %Pipeline{}} <- Pipelines.delete_pipeline(pipeline) do
      send_resp(conn, :no_content, "")
    end
  end
end
