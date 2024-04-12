defmodule BuildelWeb.OrganizationModelEmbeddingTest do
  use BuildelWeb.ConnCase, async: true
  import Buildel.OrganizationsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations/#{organization}/models/embeddings")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not list organization models if user is not a member", %{
      conn: conn
    } do
      another_organization = organization_fixture(%{})
      conn = get(conn, ~p"/api/organizations/#{another_organization}/models/embeddings")
      assert json_response(conn, 404)
    end

    test "lists all organization models", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations/#{organization}/models/embeddings")

      assert json_response(conn, 200)["data"] == [
               %{
                 "api_type" => "openai",
                 "id" => "text-embedding-ada-002",
                 "name" => "text-embedding-ada-002"
               }
             ]
    end

    test "lists all organization models filtered by api_type", %{
      conn: conn,
      organization: organization
    } do
      conn = get(conn, ~p"/api/organizations/#{organization}/models/embeddings?api_type=openai")

      assert json_response(conn, 200)["data"] == [
               %{
                 "api_type" => "openai",
                 "id" => "text-embedding-ada-002",
                 "name" => "text-embedding-ada-002"
               }
             ]
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
