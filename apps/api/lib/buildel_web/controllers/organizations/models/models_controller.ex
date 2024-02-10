defmodule BuildelWeb.OrganizationModelController do
  alias Buildel.Organizations
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  @models [
    %{id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", api_type: "openai"},
    %{id: "gpt-3.5-turbo-1106", name: "GPT-3.5 Turbo Preview", api_type: "openai"},
    %{id: "gpt-4-turbo-preview", name: "GPT-4 Turbo Preview", api_type: "openai"},
    %{id: "azure", name: "Azure", api_type: "azure"},
    %{id: "gemini-pro", name: "Gemini Pro", api_type: "google"}
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
