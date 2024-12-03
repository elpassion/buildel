defmodule BuildelWeb.OrganizationPipelineController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  alias OpenApiSpex.Schema
  alias Phoenix.PubSub

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug,
    replace_params: false

  tags ["pipeline"]

  operation :details,
    summary: "Show pipeline details",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
      start_date: [
        in: :query,
        description: "Start date",
        schema: %Schema{type: :string, format: :date_time},
        required: true
      ],
      end_date: [
        in: :query,
        description: "End date",
        schema: %Schema{type: :string, format: :date_time},
        required: true
      ]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.DetailsResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def details(conn, _params) do
    %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = conn.params
    date_params = conn.params |> Map.take(["start_date", "end_date"])

    user = conn.assigns.current_user

    with {:ok, %{start_date: start_date, end_date: end_date}} <-
           validate_date_params(date_params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         %{total_cost: total_cost} <-
           Pipelines.get_pipeline_costs_by_dates(
             pipeline,
             start_date,
             end_date
           ) do
      render(conn, :details, total_cost: total_cost)
    end
  end

  defp validate_date_params(%{"start_date" => start_date, "end_date" => end_date}) do
    with {:ok, start_date} <- NaiveDateTime.from_iso8601(start_date),
         {:ok, end_date} <- NaiveDateTime.from_iso8601(end_date) do
      {:ok, %{start_date: start_date, end_date: end_date}}
    else
      _ ->
        {:error,
         changeset_for_errors(%{
           date: "Invalid date format."
         })}
    end
  end

  defp validate_date_params(%{}) do
    {:ok, %{start_date: nil, end_date: nil}}
  end

  defp changeset_for_errors(errors) do
    %Ecto.Changeset{
      action: :validate,
      errors:
        errors
        |> Enum.map(fn {key, value} -> {key, {value, []}} end)
        |> Enum.into(%{}),
      changes: %{},
      types: %{}
    }
  end

  operation :ios,
    summary: "Show pipeline ios",
    parameters: [
      organization_id: [
        in: :path,
        description: "Organization ID",
        type: :integer,
        required: true
      ],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.IosRespnse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def ios(conn, _params) do
    %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id) do
      render(conn, :ios, pipeline: pipeline)
    end
  end

  operation :index,
    summary: "List user organization pipelines",
    parameters:
      [
        organization_id: [
          in: :path,
          description: "Organization ID",
          type: :integer,
          required: true
        ],
        favorites: [
          in: :query,
          description: "Filter by favorite",
          schema: %Schema{type: :boolean},
          required: false
        ],
        search: [
          in: :query,
          description: "Search query",
          schema: %Schema{type: :string},
          required: false
        ],
        sort: [
          in: :query,
          description: "Sort query",
          schema: %Schema{type: :string},
          required: false
        ]
      ] ++
        BuildelWeb.Schemas.Pagination.default_params(%{
          page: nil,
          per_page: nil
        }),
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.IndexResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{"organization_id" => organization_id} = conn.params
    user = conn.assigns.current_user

    params =
      Pipelines.ListParams.from_map(conn.params)

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, pipelines, count} <- Pipelines.list_organization_pipelines(organization, params) do
      render(conn, :index, pipelines: pipelines, params: params, total: count)
    end
  end

  operation :show,
    summary: "Show user organization pipeline",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  operation :create,
    summary: "Create pipeline",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body:
      {"pipeline", "application/json", BuildelWeb.Schemas.Pipelines.CreatePipelineRequest},
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{
      "organization_id" => organization_id
    } = conn.params

    %{"pipeline" => pipeline_params} = conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.create_pipeline(Map.put(pipeline_params, "organization_id", organization.id)) do
      conn
      |> put_status(:created)
      |> put_resp_header(
        "location",
        ~p"/api/organizations/#{organization.id}/pipelines/#{pipeline.id}"
      )
      |> render(:show, pipeline: pipeline)
    end
  end

  operation :update,
    summary: "Update pipeline",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body:
      {"pipeline", "application/json", BuildelWeb.Schemas.Pipelines.UpdatePipelineRequest},
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def update(conn, _params) do
    %{
      "organization_id" => organization_id,
      "pipeline_id" => pipeline_id
    } = conn.params

    %{"pipeline" => pipeline_params} = conn.body_params
    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = pipeline} <- Pipelines.update_pipeline(pipeline, pipeline_params),
         :ok <-
           Buildel.PubSub
           |> PubSub.broadcast!("buildel::logger", {:clear_logs_memory}) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  operation :favorite,
    summary: "Toggle pipeline favorite",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      ok: {"success", "application/json", BuildelWeb.Schemas.Pipelines.ShowResponse},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def favorite(conn, _params) do
    %{
      "organization_id" => organization_id,
      "pipeline_id" => pipeline_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.toggle_pipeline_favorite(pipeline) do
      render(conn, :show, pipeline: pipeline)
    end
  end

  operation :delete,
    summary: "Delete pipeline",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true],
      pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true]
    ],
    request_body: nil,
    responses: [
      no_content: {"success", "application/json", nil},
      not_found: {"not_found", "application/json", BuildelWeb.Schemas.Errors.NotFoundResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def delete(conn, _params) do
    %{
      "organization_id" => organization_id,
      "pipeline_id" => pipeline_id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, %Pipeline{}} <- Pipelines.delete_pipeline(pipeline) do
      send_resp(conn, :no_content, "")
    end
  end
end
