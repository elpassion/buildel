defmodule BuildelWeb.OrganizationPipelineChatCompletionController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator

  import BuildelWeb.UserAuth

  alias Buildel.Pipelines

  alias Buildel.Organizations

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams(:create) do
    required(:model, :string)

    required(:messages, {:array, :map}) do
      required(:role, :string)
      required(:content, :string)
    end

    optional(:stream, :boolean)
  end

  def create(
        conn,
        %{"organization_id" => organization_id, "pipeline_id" => pipeline_id, "stream" => true} =
          params
      ) do
    current_user = conn.assigns[:current_user]

    with {:ok, params} <- validate(:create, params),
         {:ok, organization} <-
           Organizations.get_user_organization(current_user, organization_id),
         {:ok, pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, "latest"),
         {:ok, run} <- Pipelines.create_run(%{pipeline_id: pipeline_id, config: config}),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      conn =
        conn
        |> put_resp_header("connection", "keep-alive")
        |> put_resp_content_type("text/event-stream")
        |> send_chunked(200)

      Stream.resource(
        fn ->
          {:ok, _} = Pipelines.Runner.create_chat_completion_stream(run, params)
          conn
        end,
        fn conn ->
          receive do
            {:chat_completion, message_delta} ->
              case Plug.Conn.chunk(
                     conn,
                     ~s(data: #{Jason.encode!(message_delta)}\n\n)
                   ) do
                {:ok, conn} -> {[], conn}
                {:error, _} -> {:halt, conn}
              end

            {:chat_end, _message} ->
              {:halt, conn}

            _ ->
              {[], conn}
          end
        end,
        fn conn ->
          Pipelines.Runner.stop_run(run)
          Plug.Conn.chunk(conn, ~s(data: [DONE]\n\n))
        end
      )
      |> Stream.run()

      conn
    end
  end

  def create(
        conn,
        %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = params
      ) do
    current_user = conn.assigns[:current_user]

    with {:ok, params} <- validate(:create, params),
         {:ok, organization} <-
           Organizations.get_user_organization(current_user, organization_id),
         {:ok, pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, "latest"),
         {:ok, run} <- Pipelines.create_run(%{pipeline_id: pipeline_id, config: config}),
         {:ok, run} <- Pipelines.Runner.start_run(run) do
      {:ok, _} =
        Pipelines.Runner.create_chat_completion_stream(run, params |> Map.put(:stream, true))

      receive do
        {:chat_end, message} ->
          Pipelines.Runner.stop_run(run)

          conn
          |> put_status(:ok)
          |> json(message)
      end
    end
  end
end
