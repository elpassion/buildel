defmodule BuildelWeb.OrganizationToolChunkControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.MemoriesFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "multipart/form-data")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :read_file,
    :create_memory_collection
  ]

  describe "create" do
    test_requires_authentication %{
      conn: conn,
      organization: organization
    } do
      post(
        conn,
        ~p"/api/organizations/#{organization.id}/tools/chunks"
      )
    end

    test "validates file is present", %{
      conn: conn,
      organization: organization
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/chunks",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not chunk in other org", %{conn: conn, upload_file: file} do
      organization = organization_fixture()

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/chunks",
          %{
            file: file,
            collection_name: "topic"
          }
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns chunks when valid", %{
      conn: conn,
      upload_file: file,
      organization: organization,
      api_spec: api_spec
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/chunks",
          %{
            file: file
          }
        )

      response = json_response(conn, 201)

      assert %{
               "data" => [%{"text" => "This is an example file!"}]
             } = response

      assert_schema(response, "ChunkShowResponse", api_spec)
    end
  end

  defp create_memory_collection(%{organization: organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    %{collection: collection}
  end

  defp read_file(_) do
    %{
      upload_file: %Plug.Upload{
        path: "test/support/fixtures/example.txt",
        filename: "example.txt"
      }
    }
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
