defmodule BuildelWeb.OrganizationPipelineRunFileController do
  use BuildelWeb, :controller
  import BuildelWeb.UserAuth

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  def show(conn, params) do
    filename = params["path"] |> URI.parse() |> Map.fetch!(:path) |> Path.basename()
    file = File.read!(params["path"])

    conn
    |> send_download({:binary, file}, filename: filename)
  end
end
