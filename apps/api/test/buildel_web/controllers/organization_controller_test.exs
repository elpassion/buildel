defmodule BuildelWeb.OrganizationControllerTest do
  use BuildelWeb.ConnCase
  import Buildel.OrganizationsFixtures
  alias Buildel.Repo
  alias Buildel.Organizations

  setup %{conn: conn} do
    {:ok,
     conn:
       put_req_header(conn, "accept", "application/json")
       |> put_req_header("content-type", "application/json")}
  end

  setup [:register_and_log_in_user, :create_user_organization]

  describe "index" do
    test "requires authentication", %{conn: conn, api_spec: api_spec} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations")
      response = json_response(conn, 401)
      assert_schema(response, "UnauthorizedResponse", api_spec)
    end

    test "lists all user organizations", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn = get(conn, ~p"/api/organizations")

      response = json_response(conn, 200)

      assert response["data"] == [
               %{"id" => organization.id, "name" => organization.name}
             ]

      assert_schema(response, "OrganizationIndexResponse", api_spec)
    end
  end

  describe "show" do
    test "requires authentication", %{conn: conn, organization: organization, api_spec: api_spec} do
      conn = conn |> log_out_user()
      conn = get(conn, ~p"/api/organizations/#{organization.id}")
      response = json_response(conn, 401)
      assert_schema(response, "UnauthorizedResponse", api_spec)
    end

    test "does not allow to access another user's organization", %{conn: conn, api_spec: api_spec} do
      organization = organization_fixture()
      conn = get(conn, ~p"/api/organizations/#{organization.id}")
      response = json_response(conn, 404)
      assert_schema(response, "NotFoundResponse", api_spec)
    end

    test "returns the organization with given id", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn = get(conn, ~p"/api/organizations/#{organization.id}")

      response = json_response(conn, 200)

      assert response["data"] == %{
               "id" => organization.id,
               "name" => organization.name
             }

      assert_schema(response, "OrganizationShowResponse", api_spec)
    end
  end

  describe "create" do
    test "requires authentication", %{conn: conn, api_spec: api_spec} do
      conn = conn |> log_out_user()

      conn =
        post(conn, ~p"/api/organizations", organization: %{name: "some name"})

      response = json_response(conn, 401)["errors"]
      assert_schema(response, "UnauthorizedResponse", api_spec)
    end

    test "validates organization name", %{conn: conn} do
      conn =
        post(conn, ~p"/api/organizations", organization: %{})

      assert json_response(conn, 422)["errors"] != %{}
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

    test "does not allow to update another user's organization", %{conn: conn} do
      organization = organization_fixture()

      conn =
        put(conn, ~p"/api/organizations/#{organization.id}", %{organization: %{name: "new name"}})

      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns the organization", %{conn: conn, organization: organization} do
      put(conn, ~p"/api/organizations/#{organization.id}", organization: %{name: "new name"})

      assert Organizations.get_organization!(organization.id).name == "new name"
    end
  end

  describe "get_api_key" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn = get(conn, ~p"/api/organizations/#{organization.id}/api_key")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not allow to access another user's organization", %{conn: conn} do
      organization = organization_fixture()
      conn = get(conn, ~p"/api/organizations/#{organization.id}/api_key")
      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns the organization api key", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/api_key")

      assert json_response(conn, 200)["data"] == %{
               "key" => organization.api_key
             }
    end
  end

  describe "reset_api_key" do
    test "requires authentication", %{conn: conn, organization: organization} do
      conn = conn |> log_out_user()

      conn = post(conn, ~p"/api/organizations/#{organization.id}/api_key")

      assert json_response(conn, 401)["errors"] != %{}
    end

    test "does not allow to access another user's organization", %{conn: conn} do
      organization = organization_fixture()
      conn = post(conn, ~p"/api/organizations/#{organization.id}/api_key")
      assert json_response(conn, 404)["errors"] != %{}
    end

    test "returns the organization with new api key", %{conn: conn, organization: organization} do
      conn = post(conn, ~p"/api/organizations/#{organization.id}/api_key")

      organization = organization |> Repo.reload!()

      assert json_response(conn, 200)["data"] == %{
               "key" => organization.api_key
             }
    end
  end

  defp create_user_organization(%{user: user}) do
    membership = membership_fixture(%{user_id: user.id})
    organization = membership |> Map.get(:organization_id) |> Organizations.get_organization!()
    %{organization: organization}
  end
end
