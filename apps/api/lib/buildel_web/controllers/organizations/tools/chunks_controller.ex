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
    ],
    security: [%{"authorization" => []}]

  def create(conn, _params) do
    %{organization_id: organization_id} = conn.params
    %{file: file, chunk_size: chunk_size, chunk_overlap: chunk_overlap} = conn.body_params

    user = conn.assigns.current_user

    file_properties = %{
      path: file |> Map.get(:path),
      type: file |> Map.get(:content_type),
      name: file |> Map.get(:filename)
    }

    with {:ok, _organization} <-
           Buildel.Organizations.get_user_organization(user, organization_id) do
      %{file_type: file_type, file_name: file_name} =
        Buildel.FileLoader.file_properties(file_properties)

      workflow =
        Buildel.DocumentWorkflow.new(%{
          embeddings:
            Buildel.Clients.Embeddings.new(%{
              api_type: "does",
              model: "not matter",
              api_key: "key"
            }),
          collection_name: "name",
          db_adapter: Buildel.VectorDB.EctoAdapter,
          workflow_config: %{
            chunk_size: chunk_size,
            chunk_overlap: chunk_overlap
          }
        })

      document = Buildel.DocumentWorkflow.read(workflow, {file.path, file_type})

      with chunks when is_list(chunks) <-
             Buildel.DocumentWorkflow.build_node_chunks(workflow, document),
           chunks <-
             put_in(
               chunks,
               [Access.all(), Access.key!(:metadata), :file_name],
               file_name
             ) do
        conn
        |> put_status(:created)
        |> render(:show, chunks: chunks)
      end
    end
  end
end
