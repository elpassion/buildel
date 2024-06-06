defmodule BuildelWeb.OrganizationPipelineRunController do
  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  import BuildelWeb.UserAuth

  alias Buildel.BlockPubSub
  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline
  alias OpenApiSpex.Schema
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
        pipeline_id: [in: :path, description: "Pipeline ID", type: :integer, required: true],
        start_date: [
          in: :query,
          description: "Start date",
          schema: %Schema{type: :string, format: :date_time},
          required: false
        ],
        end_date: [
          in: :query,
          description: "End date",
          schema: %Schema{type: :string, format: :date_time},
          required: false
        ]
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
    ],
    security: [%{"authorization" => []}]

  def index(conn, _params) do
    %{organization_id: organization_id, pipeline_id: pipeline_id} = conn.params
    pagination_params = conn.params |> Map.take([:page, :per_page])
    date_params = conn.params |> Map.take([:start_date, :end_date])

    user = conn.assigns.current_user

    with {:ok, %{start_date: start_date, end_date: end_date}} <-
           validate_date_params(date_params),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, runs, total} <-
           Pipelines.PipelineRunManager.list_pipeline_runs(
             pipeline,
             Map.merge(pagination_params, %{start_date: start_date, end_date: end_date})
           ) do
      render(conn, :index, runs: runs, pagination_params: pagination_params, total: total)
    end
  end

  defp validate_date_params(%{start_date: start_date, end_date: end_date}) do
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
    ],
    security: [%{"authorization" => []}]

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
    ],
    security: [%{"authorization" => []}]

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
    request_body: {"start", "application/json", BuildelWeb.Schemas.Runs.StartRequest},
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
        {"bad request", "application/json", BuildelWeb.Schemas.Errors.BudgetLimitExceededResponse}
    ],
    security: [%{"authorization" => []}]

  def start(conn, _params) do
    %{initial_inputs: initial_inputs, wait_for_outputs: wait_for_outputs} =
      conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    with {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, _} <-
           Pipelines.verify_pipeline_budget_limit(pipeline),
         {:ok, run} <-
           Pipelines.get_pipeline_run(pipeline, id),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      outputs =
        wait_for_outputs
        |> Enum.map(fn output ->
          topic =
            BlockPubSub.io_topic(
              Buildel.Pipelines.Worker.context_id(run),
              output.block_name,
              output.output_name
            )

          BlockPubSub.subscribe_to_io(
            Buildel.Pipelines.Worker.context_id(run),
            output.block_name,
            output.output_name
          )

          %{
            block_name: output.block_name,
            output_name: output.output_name,
            topic: topic,
            data: nil
          }
        end)

      initial_inputs |> Enum.each(&process_input(&1.block_name, &1.input_name, &1.data, run))

      outputs =
        Enum.reduce_while(Stream.repeatedly(fn -> nil end), outputs, fn _, outputs ->
          outputs = receive_output(outputs)

          if Enum.any?(outputs, &(&1.data == nil)) do
            {:cont, outputs}
          else
            {:halt, outputs}
          end
        end)

      render(conn, :start, %{run: run, outputs: outputs})
    else
      {:error, :budget_limit_exceeded} -> {:error, :bad_request, "Budget limit exceeded"}
      err -> err
    end
  end

  defp receive_output([]), do: []

  defp receive_output(outputs) do
    topics = outputs |> Enum.map(& &1[:topic])

    receive do
      {topic, type, data, _metadata} when type != :start_stream and type != :stop_stream ->
        if topic in topics do
          outputs
          |> update_in(
            [
              Access.at(Enum.find_index(outputs, fn output -> output[:topic] == topic end)),
              :data
            ],
            fn _ -> data end
          )
        else
          outputs
        end

      _other ->
        outputs
    end
  end

  defp process_input(block_name, input_name, data, run) do
    context_id = Pipelines.Worker.context_id(run)

    data =
      case data do
        {:binary, _} -> data
        _ -> {:text, data}
      end

    Buildel.BlockPubSub.broadcast_to_io(context_id, block_name, input_name, data)
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
    ],
    security: [%{"authorization" => []}]

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
    ],
    security: [%{"authorization" => []}]

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

  operation :input_file,
    summary: "Add run input file",
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
    request_body: {"file", "multipart/form-data", BuildelWeb.Schemas.Runs.FileInputRequest},
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
    ],
    security: [%{"authorization" => []}]

  def input_file(conn, _params) do
    %{
      block_name: block_name,
      input_name: input_name,
      file: file
    } = conn.body_params

    %{
      organization_id: organization_id,
      pipeline_id: pipeline_id,
      id: id
    } = conn.params

    user = conn.assigns.current_user

    file_id = UUID.uuid4()

    with {:ok, organization} <-
           Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, run} <- Pipelines.get_running_pipeline_run(pipeline, id),
         block_pid <- Buildel.Pipelines.Runner.block_pid(run, block_name),
         :ok <- Plug.Upload.give_away(file, block_pid),
         {:ok, _run} <-
           Pipelines.Runner.cast_run(
             run,
             block_name,
             input_name,
             {:binary, file |> Map.get(:path)},
             %{
               file_id: file_id,
               file_name: file |> Map.get(:filename),
               file_type: file |> Map.get(:content_type)
             }
           ) do
      render(conn, :input_file,
        file: %{
          id: file_id,
          file_name: file |> Map.get(:filename),
          file_size: 1,
          file_type: file |> Map.get(:content_type)
        }
      )
    else
      {:error, :not_running} -> {:error, :bad_request}
      err -> err
    end
  end

  operation :input_file_delete,
    summary: "Remove run input file",
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
    request_body: {"input", "application/json", BuildelWeb.Schemas.Runs.FileInputRemoveRequest},
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
    ],
    security: [%{"authorization" => []}]

  def input_file_delete(conn, _params) do
    %{
      block_name: block_name,
      input_name: input_name,
      file_id: file_id
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
         {:ok, run} <-
           Pipelines.Runner.cast_run(run, block_name, input_name, {:text, file_id}, %{
             method: :delete
           }) do
      render(conn, :show, run: run)
    else
      {:error, :not_running} -> {:error, :bad_request}
      err -> err
    end
  end
end
