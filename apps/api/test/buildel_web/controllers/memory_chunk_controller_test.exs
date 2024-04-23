defmodule BuildelWeb.MemoryChunkControllerTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  import Buildel.MemoriesFixtures

  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       conn
       |> put_req_header("accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [
    :register_and_log_in_user,
    :create_user_organization,
    :create_collection,
    :create_memory
  ]

  describe "index" do
    test_requires_authentication %{
      conn: conn,
      organization: organization,
      collection: collection,
      memory: memory
    } do
      get(
        conn,
        ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories/#{memory.id}/chunks"
      )
    end

    test "does not list memory chunks from other org", %{
      conn: conn,
      another_collection: another_collection,
      another_memory: another_memory
    } do
      conn =
        get(
          conn,
          ~p"/api/organizations/#{another_collection.organization_id}/memory_collections/#{another_collection.id}/memories/#{another_memory.id}/chunks"
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "lists paginated memory chunks", %{
      conn: conn,
      organization: organization,
      collection: collection,
      memory: memory,
      api_spec: api_spec
    } do
      conn =
        get(
          conn,
          ~p"/api/organizations/#{organization.id}/memory_collections/#{collection.id}/memories/#{memory.id}/chunks?page=0&per_page=2"
        )

      response = json_response(conn, 200)
      assert [%{"content" => _, "id" => _}] = response["data"]
      assert %{"page" => 0, "per_page" => 2, "total" => 1} = response["meta"]
      assert_schema(response, "MemoryChunkIndexResponse", api_spec)
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end

  defp create_collection(%{organization: organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    another_collection = collection_fixture()
    %{collection: collection, another_collection: another_collection}
  end

  defp create_memory(%{
         organization: organization,
         collection: collection,
         another_collection: another_collection
       }) do
    memory = memory_fixture(organization.id, collection.collection_name)

    another_memory =
      memory_fixture(another_collection.organization_id, another_collection.collection_name)

    %{memory: memory, another_memory: another_memory}
  end
end
