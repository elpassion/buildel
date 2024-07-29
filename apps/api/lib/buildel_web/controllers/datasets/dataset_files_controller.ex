defmodule BuildelWeb.DatasetFilesController do
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

  tags ["dataset"]

  operation :create,
    summary: "Create a new dataset file upload",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer]
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
      organization_id: organization_id
    } =
      conn.params

    %{
      file: file
    } = conn.body_params

    user = conn.assigns.current_user

    with {:ok, organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         :ok <-
           give_away(file, Process.whereis(Buildel.Datasets.DatasetFile)),
         {:ok, file_upload} <-
           Buildel.Datasets.DatasetFile.create(organization, conn.body_params.file) do
      conn
      |> put_status(:created)
      |> render(:show, %{file: file_upload})
    end
  end

  operation :show,
    summary: "Retrieves file upload",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer],
      id: [in: :path, description: "Dataset ID", type: :string]
    ],
    request_body: nil,
    responses: [
      ok: {"ok", "application/json", BuildelWeb.Schemas.Collections.FileResponse},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ],
    security: [%{"authorization" => []}]

  def show(conn, _params) do
    %{
      organization_id: organization_id,
      id: id
    } =
      conn.params

    user = conn.assigns.current_user

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id),
         {:ok, file_upload} when is_map(file_upload) <-
           Buildel.Datasets.DatasetFile.get(id) do
      conn
      |> render(:show, %{file: file_upload})
    else
      {:ok, nil} -> {:error, :not_found}
    end
  end

  defp give_away(%Plug.Upload{} = upload, pid) do
    Plug.Upload.give_away(upload, pid)
    :ok
  end
end
