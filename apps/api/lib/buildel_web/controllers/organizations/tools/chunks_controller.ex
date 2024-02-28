defmodule BuildelWeb.OrganizationToolChunkController do
  use BuildelWeb, :controller

  use OpenApiSpex.ControllerSpecs
  import BuildelWeb.UserAuth
  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  plug OpenApiSpex.Plug.CastAndValidate,
    json_render_error_v2: true,
    render_error: BuildelWeb.ErrorRendererPlug

  tags ["organization"]

  operation :create,
    summary: "Create file chunks",
    parameters: [
      organization_id: [in: :path, description: "Organization ID", type: :integer, required: true]
    ],
    request_body: {"chunk", "multipart/form-data", BuildelWeb.Schemas.Chunks.CreateChunkRequest},
    responses: [
      created: {"created", "application/json", BuildelWeb.Schemas.Chunks.ShowResponse},
      unprocessable_entity:
        {"unprocessable entity", "application/json",
         BuildelWeb.Schemas.Errors.UnprocessableEntity},
      unauthorized:
        {"unauthorized", "application/json", BuildelWeb.Schemas.Errors.UnauthorizedResponse},
      forbidden: {"forbidden", "application/json", BuildelWeb.Schemas.Errors.ForbiddenResponse}
    ]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params
    %{file: file, chunk_size: chunk_size, chunk_overlap: chunk_overlap} = conn.body_params

    user = conn.assigns.current_user

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id) do
      file_properties = %{
        path: file |> Map.get(:path),
        type: file |> Map.get(:content_type),
        name: file |> Map.get(:filename)
      }

      %{file_type: file_type} = Buildel.FileLoader.file_properties(file_properties)
      {:ok, file} = Buildel.FileLoader.load_file(file_properties.path, %{type: file_type})

      chunks =
        Buildel.Splitters.recursive_character_text_split(file, %{
          chunk_size: chunk_size,
          chunk_overlap: chunk_overlap
        })
        |> Enum.map(fn chunk -> %{text: chunk} end)

      conn
      |> put_status(:created)
      |> render(:show, chunks: chunks)
    end
  end
end
