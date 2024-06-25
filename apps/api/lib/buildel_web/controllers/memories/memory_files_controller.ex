defmodule BuildelWeb.MemoryFilesController do
  require Config
  import BuildelWeb.UserAuth

  use BuildelWeb, :controller
  use OpenApiSpex.ControllerSpecs

  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["memory"]

  operation :create,
    summary: "Create a new file upload",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Collection ID", type: :integer]
    ],
    request_body: {"file", "multipart/form-data", BuildelWeb.Schemas.Collections.FileRequest},
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.FileResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{
      organization_id: organization_id,
      id: id
    } =
      conn.params

    %{
      file: file
    } = conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, collection} <-
           Buildel.Memories.get_organization_collection(organization, id),
         :ok <-
           give_away(file, Process.whereis(Buildel.Memories.MemoryFile)),
         {:ok, file_upload} <-
           Buildel.Memories.MemoryFile.create(organization, collection, conn.body_params.file) do
      conn
      |> put_status(:created)
      |> render(:show, %{file: file_upload})
    end
  end

  defp give_away(%Plug.Upload{} = upload, pid) do
    Plug.Upload.give_away(upload, pid)
    :ok
  end
end
