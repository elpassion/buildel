defmodule BuildelWeb.OrganizationToolChunkController do
  use BuildelWeb, :controller

  use BuildelWeb.Validator
  import BuildelWeb.UserAuth
  action_fallback(BuildelWeb.FallbackController)

  plug(:fetch_current_user)
  plug(:require_authenticated_user)

  defparams :create do
    required(:file, :map)
    required(:chunk_size, :integer)
    required(:chunk_overlap, :integer)
  end

  @create_default_params %{
    "chunk_size" => 1000,
    "chunk_overlap" => 250
  }

  def create(
        conn,
        %{"organization_id" => organization_id} =
          params
      ) do
    params = Map.merge(@create_default_params, params)

    user = conn.assigns.current_user

    with {:ok, %{file: file, chunk_size: chunk_size, chunk_overlap: chunk_overlap}} <-
           validate(:create, params),
         {:ok, _organization} <-
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
