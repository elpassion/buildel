defmodule BuildelWeb.OrganizationPipelineChatCompletionController do
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
    required(:model, :string)

    required(:messages, {:array, :map}) do
      required(:role, :string)
      required(:content, :string)
    end
  end

  def create(
        conn,
        %{"organization_id" => organization_id, "pipeline_id" => _pipeline_id} = params
      ) do
    current_user = conn.assigns[:current_user]

    with {:ok, params} <- validate(:create, conn.params),
         {:ok, organization} <- Organizations.get_user_organization(current_user, organization_id) do
      conn
      |> put_status(201)
      |> json(%{})
    end
  end
end
