defmodule BuildelWeb.OrganizationModelController do
  alias Buildel.Clients.Chat
  alias Buildel.Organizations
  use BuildelWeb, :controller

  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  @models [
    %{id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", api_type: "openai"},
    %{id: "gpt-3.5-turbo-0125", name: "GPT-3.5 Turbo Preview", api_type: "openai"},
    %{id: "gpt-4-turbo-preview", name: "GPT-4 Turbo Preview", api_type: "openai"},
    %{id: "gpt-4-turbo", name: "GPT-4 Turbo", api_type: "openai"},
    %{id: "gpt-4o", name: "GPT-4o", api_type: "openai"},
    %{id: "azure", name: "Azure", api_type: "azure"},
    %{id: "gemini-pro", name: "Gemini Pro", api_type: "google"},
    %{id: "gemini-1.5-pro-latest", name: "Gemini 1.5 Pro", api_type: "google"},
    %{id: "mistral-tiny", name: "Mistral Tiny", api_type: "mistral"},
    %{id: "mistral-small-latest", name: "Mistral Small", api_type: "mistral"},
    %{id: "mistral-medium-latest", name: "Mistral Medium", api_type: "mistral"},
    %{id: "mistral-large-latest", name: "Mistral Large", api_type: "mistral"}
  ]

  def index(conn, %{
        "organization_id" => organization_id,
        "api_type" => api_type,
        "endpoint" => endpoint,
        "api_key" => api_key
      }) do
    current_user = conn.assigns.current_user

    with {:ok, organization} <-
           Organizations.get_user_organization(current_user, organization_id),
         {:ok, secret} <- Organizations.get_organization_secret(organization, api_key) do
      openai_models =
        Chat.get_models(%{endpoint: endpoint, api_key: secret.value, api_type: api_type})
        |> Enum.map(fn model ->
          %{id: model["id"], name: model["id"], api_type: "openai"}
        end)

      local_models =
        @models
        |> Enum.filter(fn model -> model.api_type == "openai" end)

      models =
        (local_models ++ openai_models)
        |> Enum.uniq_by(& &1.id)

      render(conn, :index, models: models)
    end
  end

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
