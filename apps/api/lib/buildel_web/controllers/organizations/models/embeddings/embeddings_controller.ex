defmodule BuildelWeb.OrganizationModelEmbeddingController do
  alias Buildel.Organizations
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  @models [
    %{
      api_type: "openai",
      id: "text-embedding-ada-002",
      name: "text-embedding-ada-002"
    },
    %{
      api_type: "openai",
      id: "text-embedding-3-small",
      name: "text-embedding-3-small"
    },
    %{
      api_type: "openai",
      id: "text-embedding-3-large",
      name: "text-embedding-3-large"
    },
    %{
      api_type: "mistral",
      id: "mistral-embed",
      name: "mistral-embed"
    }
  ]

  def index(conn, %{"organization_id" => organization_id, "api_type" => type}) do
    current_user = conn.assigns.current_user

    with {:ok, _organization} <-
           Organizations.get_user_organization(current_user, organization_id) do
      render(conn, :index, models: @models |> Enum.filter(fn model -> model.api_type == type end))
    end
  end

  def index(conn, %{"organization_id" => organization_id}) do
    current_user = conn.assigns.current_user

    with {:ok, _organization} <-
           Organizations.get_user_organization(current_user, organization_id) do
      render(conn, :index, models: @models)
    end
  end
end
