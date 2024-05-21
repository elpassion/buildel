defmodule BuildelWeb.OrganizationToolEmbeddingsControllerTest do
  use BuildelWeb.ConnCase, async: true
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
    :create_memory_collection
  ]

  describe "create" do
    test_requires_authentication %{
      conn: conn,
      organization: organization
    } do
      post(
        conn,
        ~p"/api/organizations/#{organization.id}/tools/embeddings"
      )
    end

    test "validates params are present", %{
      conn: conn,
      organization: organization
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/embeddings",
          %{}
        )

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "does not generate in other org", %{conn: conn, collection: collection} do
      organization = organization_fixture()

      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/embeddings",
          %{
            memory_collection_id: collection.id,
            inputs: ["inputs"]
          }
        )

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns embeddings when valid", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec,
      collection: collection
    } do
      conn =
        post(
          conn,
          ~p"/api/organizations/#{organization.id}/tools/embeddings",
          %{
            memory_collection_id: collection.id,
            inputs: ["inputs"]
          }
        )

      response = json_response(conn, 201)

      assert %{
               "embeddings" => _,
               "embeddings_tokens" => 100
             } = response

      assert_schema(response, "EmbeddingsShowResponse", api_spec)
    end
  end

  defp create_memory_collection(%{organization: organization}) do
    collection = collection_fixture(%{organization_id: organization.id})
    %{collection: collection}
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
