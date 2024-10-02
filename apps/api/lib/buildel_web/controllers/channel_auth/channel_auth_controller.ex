defmodule BuildelWeb.ChannelAuthController do
  use BuildelWeb, :controller
  use BuildelWeb.Validator
  import BuildelWeb.UserAuth

  alias Buildel.Pipelines
  alias Buildel.Pipelines.Pipeline

  alias Buildel.Organizations

  action_fallback BuildelWeb.FallbackController

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :create do
    required(:channel_name, :string, format: ~r/(pipelines|logs):\d+:\d+/)
    required(:socket_id, :string)
  end

  defp parse_ids([organization_id, pipeline_id]) do
    {organization_id, pipeline_id, nil}
  end

  defp parse_ids([organization_id, pipeline_id, run_id]) do
    {organization_id, pipeline_id, run_id}
  end

  def create(
        conn,
        %{"channel_name" => "pipelines:" <> _organization_pipeline_id = _channel_name} = params
      ) do
    user = conn.assigns.current_user

    with {:ok,
          %{
            channel_name: "pipelines:" <> organization_pipeline_id = channel_name,
            socket_id: socket_id
          }} <- validate(:create, params),
         ids <- String.split(organization_pipeline_id, ":"),
         {organization_id, pipeline_id, _runId} <- parse_ids(ids),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = _pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id) do
      user_json = Jason.encode!(%{id: user.id})

      conn
      |> put_status(200)
      |> json(%{
        auth:
          BuildelWeb.ChannelAuth.create_auth_token(
            socket_id,
            channel_name,
            user_json,
            organization.api_key
          ),
        user_data: user_json
      })
    else
      {:error, :not_found} ->
        {:error, :unauthorized}

      err ->
        err
    end
  end

  def create(
        conn,
        %{"channel_name" => "logs:" <> _organization_pipeline_run_id = _channel_name} = params
      ) do
    user = conn.assigns.current_user

    with {:ok,
          %{
            channel_name: "logs:" <> organization_pipeline_run_id = channel_name,
            socket_id: socket_id
          }} <- validate(:create, params),
         [organization_id, pipeline_id, run_id] <-
           String.split(organization_pipeline_run_id, ":"),
         {:ok, organization} <- Organizations.get_user_organization(user, organization_id),
         {:ok, %Pipeline{} = pipeline} <-
           Pipelines.get_organization_pipeline(organization, pipeline_id),
         {:ok, _} <- Pipelines.get_pipeline_run(pipeline, run_id) do
      user_json = Jason.encode!(%{id: user.id})

      conn
      |> put_status(200)
      |> json(%{
        auth:
          BuildelWeb.ChannelAuth.create_auth_token(
            socket_id,
            channel_name,
            user_json,
            organization.api_key
          ),
        user_data: user_json
      })
    else
      {:error, :not_found} ->
        {:error, :unauthorized}

      err ->
        err
    end
  end

  def create(_conn, params) do
    with {:ok,
          %{
            channel_name: _channel_name,
            socket_id: _socket_id
          }} <- validate(:create, params) do
      {:error, :not_found}
    else
      {:error, :not_found} ->
        {:error, :unauthorized}

      err ->
        err
    end
  end
end
