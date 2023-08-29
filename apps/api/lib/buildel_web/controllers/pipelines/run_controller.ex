defmodule BuildelWeb.RunController do
  use BuildelWeb, :controller

  require Logger
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Run

  action_fallback BuildelWeb.FallbackController

  def index(conn, _params) do
    runs = Pipelines.list_runs()
    render(conn, :index, runs: runs)
  end

  def create(conn, %{"run" => run_params}) do
    with {:ok, %Run{} = run} <- Pipelines.create_run(run_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/runs/#{run}")
      |> render(:show, run: run)
    end
  end

  def show(conn, %{"id" => id}) do
    with %Run{} = run <- Pipelines.get_run(id) do
      render(conn, :show, run: run)
    else
      _ -> {:error, :not_found}
    end
  end

  def start(conn, %{"id" => id}) do
    with %Run{} = run <- Pipelines.get_run(id),
         {:ok, %Run{} = run} <- run |> Pipelines.Runner.start_run() do
      render(conn, :show, run: run)
    else
      err ->
        Logger.debug("Error stopping run: #{inspect(err)}")
        {:error, :not_found}
    end
  end

  def stop(conn, %{"id" => id}) do
    with %Run{} = run <- Pipelines.get_run(id),
         {:ok, %Run{} = run} <- run |> Pipelines.Runner.stop_run() do
      render(conn, :show, run: run)
    else
      err ->
        Logger.debug("Error stopping run: #{inspect(err)}")
        {:error, :not_found}
    end
  end
end
