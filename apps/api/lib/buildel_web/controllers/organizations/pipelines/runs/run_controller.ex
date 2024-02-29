defmodule BuildelWeb.OrganizationPipelineRunController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["run"]

  operation :index,
    summary: "List pipeline runs",
    parameters:
      [
        organization_id: [
          in: :path,
          description: "Organization ID",
          type: :integer,
          required: true
        ],
        pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
      ] ++ BuildelWeb.Schemas.Pagination.default_params(),
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def index(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id} = conn.params
    pagination_params = conn.params |> Map.take([:page, :per_page])

    IO.inspect(conn.params)
    IO.inspect(pagination_params)
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         runs <- Pipelines.list_pipeline_runs(pipeline) do
      render(conn, :index, runs: runs, pagination_params: pagination_params)
    end
  end

  operation :show,
    summary: "Show pipeline run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def show(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id, id: id} = conn.params
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id) do
      render(conn, :show, run: run)
    end
  end

  operation :create,
    summary: "Create pipeline run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: {"run", "application/json", BuildelWeb.Schemas.Runs.CreateRequest},
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def create(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id} = conn.params
    %{metadata: metadata, alias: alias} = conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
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

  operation :start,
    summary: "Start pipeline run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def start(conn, _params) do
    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      render(conn, :show, run: run)
    end
  end

  operation :stop,
    summary: "Stop pipeline run",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def stop(conn, _params) do
    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.stop_run(run) do
      render(conn, :show, run: run)
    end
  end

  operation :input,
    summary: "Add run input",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      id: [in: :path, description: "Run ID", type: :integer, required: true]
    ],
    request_body: {"input", "application/json", BuildelWeb.Schemas.Runs.InputRequest},
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Runs.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse},
      bad_request:
        {"bad request", "application/json", BuildelWeb.Schemas.Errors.BadRequestResponse}
    ]

  def input(conn, _params) do
    %{
      block_name: block_name,
      input_name: input_name,
      data: data
    } = conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
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
