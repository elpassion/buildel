defmodule BuildelWeb.OrganizationControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok, conn: put_req_header(conn, "accept", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test "requires authentication", %{conn: conn} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "lists all user organizations", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations")

      assert json_response(conn, 200)["data"] == [
               %{"id" => organization.id, "name" => organization.name}
             ]
    end
  end

  describe "show" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations/#{organization.id}")
      assert json_response(conn, 401)["errors"] != %{}
    end

    test "returns the organization with given id", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations/#{organization.id}")

      assert json_response(conn, 200)["data"] == %{
               "id" => organization.id,
               "name" => organization.name
             }
    end
  end

  describe "create" do
    test "requires authentication", %{conn: conn} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations", organization: %{name: "some name"})

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "returns created organization", %{conn: conn} do
      conn =
        post(conn, ~p"/api/organizations", organization: %{name: "some name"})

      assert %{"id" => _id, "name" => "some name"} = json_response(conn, 201)["data"]
    end
  end

  describe "update" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn =
        put(conn, ~p"/api/organizations/#{organization.id}", organization)

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "returns the organization", %{conn: conn, organization: organization} do
      put(conn, ~p"/api/organizations/#{organization.id}", organization: %{name: "new name"})

      assert Organizations.get_organization!(organization.id).name == "new name"
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
