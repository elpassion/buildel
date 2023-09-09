defmodule BuildelWeb.OrganizationControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user]

  describe "index" do
    test "requires authentication", %{conn: conn} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "lists all user organizations", %{conn: conn, user: user} do
      _organization = organization_fixture()
      membership = membership_fixture(%{user_id: user.id})

      user_organization =
        membership |> Map.get(:organization_id) |> Organizations.get_organization!()

      conn = get(conn, ~p"/api/organizations")
      assert json_response(conn, 200)["data"] == [%{"id" => user_organization.id}]
    end
  end
end
