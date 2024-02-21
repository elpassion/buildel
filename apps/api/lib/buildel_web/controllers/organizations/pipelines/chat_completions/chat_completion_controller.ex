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
  end

  def create(
        conn,
        %{"organization_id" => organization_id, "pipeline_id" => pipeline_id} = params
      ) do
    current_user = conn.assigns[:current_user]

    with {:ok, params} <- validate(:create, conn.params),
         {:ok, organization} <-
           Organizations.get_user_organization(current_user, organization_id),
         {:ok, pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, config} <- Pipelines.get_pipeline_config(pipeline, "latest"),
         {:ok, run} <- Pipelines.create_run(%{pipeline_id: pipeline_id, config: config}),
         {:ok, run} <- Pipelines.Runner.start_run(run),
         {:ok, _chat_completion} <-
           Pipelines.Runner.create_chat_completion(run, params),
         {:ok, _run} <- Pipelines.Runner.stop_run(run) do
      conn
      |> put_status(:created)
      |> json(%{})
    end
  end
end
