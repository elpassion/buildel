defmodule BuildelWeb.MemoryCollectionControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  import Buildel.PipelinesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization, :create_pipeline, :read_file]

  describe "create" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "validates name is present", %{conn: conn, organization: organization} do
      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not create in other org", %{conn: conn} do
      organization = organization_fixture()

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: "topic"
        })

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns :created when valid", %{
      conn: conn,
      pipeline: pipeline,
      organization: organization
    } do
      collection_name = "pipelines:#{pipeline.id}"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: collection_name
        })

      assert %{
               "data" => %{
                 "name" => ^collection_name,
                 "id" => _
               }
             } = json_response(conn, 201)
    end

    test "saves metadata", %{
      conn: conn,
      pipeline: pipeline,
      organization: organization
    } do
      collection_name = "pipelines:#{pipeline.id}"

      conn =
        post(conn, ~p"/api/organizations/#{organization.id}/memory_collections", %{
          collection_name: collection_name
        })

      assert %{
               "data" => %{
                 "name" => ^collection_name,
                 "id" => id
               }
             } = json_response(conn, 201)

      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{id}"
        )

      assert %{
               "data" => 
                 %{
                   "id" => ^id,
                   "name" => ^collection_name,
                 }
               
             } = json_response(conn, 200)
    end
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
