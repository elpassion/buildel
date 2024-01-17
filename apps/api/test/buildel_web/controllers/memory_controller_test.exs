defmodule BuildelWeb.MemoryControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures
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
    :create_pipeline,
    :read_file,
    :create_memory_collection
  ]

  describe "create" do
    test "requires authentication", %{
      conn: conn,
      organization: organization,
      collection: collection
    } do
      conn = conn |> log_out_user()

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories"
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "validates file is present", %{
      conn: conn,
      organization: organization,
      collection: collection
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not upload in other org", %{conn: conn, upload_file: file, collection: collection} do
      organization = organization_fixture()

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories",
          %{
            file: file,
            collection_name: "topic"
          }
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns :created when valid", %{
      conn: conn,
      upload_file: file,
      organization: organization,
      collection: collection
    } do
      collection_name = collection.collection_name

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories",
          %{
            file: file
          }
        )

      assert %{
               "data" => %{
                 "file_name" => "example.txt",
                 "file_size" => 24,
                 "file_type" => "text/plain",
                 "collection_name" => ^collection_name,
                 "id" => _
               }
             } = json_response(conn, 201)
    end

    test "saves metadata", %{
      conn: conn,
      upload_file: file,
      organization: organization,
      collection: collection
    } do
      collection_name = collection.collection_name

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories",
          %{
            file: file,
            collection_name: collection_name
          }
        )

      assert %{
               "data" => %{
                 "file_name" => "example.txt",
                 "file_size" => 24,
                 "file_type" => "text/plain",
                 "collection_name" => ^collection_name,
                 "id" => _
               }
             } = json_response(conn, 201)

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories"
        )

      assert %{
               "data" => [
                 %{
                   "file_name" => "example.txt",
                   "file_size" => 24,
                   "file_type" => "text/plain",
                   "id" => _
                 }
               ]
             } = json_response(conn, 200)
    end
  end

  describe "delete" do
    setup [:create_memory]

    test "requires authentication", %{
      conn: conn,
      organization: organization,
      memory: memory,
      collection: collection
    } do
      conn = conn |> log_out_user()

      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories/#{memory.id}"
        )

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not delete in other org", %{conn: conn, collection: collection} do
      organization = organization_fixture()
      memory = memory_fixture(organization.id, "collection")

      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories/#{memory.id}"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns :no_content when valid", %{
      conn: conn,
      organization: organization,
      memory: memory,
      collection: collection
    } do
      conn =
        delete(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories/#{memory.id}"
        )

      assert json_response(conn, 200) == %{}
    end
  end

  defp create_memory(%{organization: organization}) do
    memory = memory_fixture(organization.id, "collection")
    %{memory: memory}
  end

  defp create_memory_collection(%{organization: organization}) do
    collection = collection_fixture(organization.id)
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

  defp create_pipeline(%{organization: organization}) do
    pipeline = pipeline_fixture(%{organization_id: organization.id})
    %{pipeline: pipeline}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
