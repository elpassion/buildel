defmodule BuildelWeb.OrganizationControllerTest do
  use BuildelWeb.ConnCase, async: true
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
    test_requires_authentication %{conn: conn} do
      get(conn, ~p"/api/organizations")
    end

    test "lists all user organizations", %{
      conn: conn,
      organization: organization,
      api_spec: api_spec
    } do
      conn = get(conn, ~p"/api/organizations")

      response = json_response(conn, 200)

      assert response["data"] == [
               %{"id" => organization.id, "name" => organization.name, "el_id" => nil}
             ]

      assert_schema(response, "OrganizationIndexResponse", api_spec)
    end
  end

  describe "show" do
    test_requires_authentication %{organization: organization, conn: conn} do
      get(conn, ~p"/api/organizations/#{organization}")
    end

    test_not_found %{conn: conn, another_organization: organization} do
      get(conn, ~p"/api/organizations/#{organization}")
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
               "name" => organization.name,
               "el_id" => nil
             }

      assert_schema(response, "OrganizationShowResponse", api_spec)
    end
  end

  describe "create" do
    test_requires_authentication %{conn: conn} do
      post(conn, ~p"/api/organizations", organization: %{name: "some name"})
    end

    test "validates organization name", %{conn: conn} do
      conn =
        post(conn, ~p"/api/organizations", organization: %{})

      assert json_response(conn, 422)["errors"] != %{}
    end

    test "returns created organization", %{conn: conn} do
      conn =
        post(conn, ~p"/api/organizations", organization: %{name: "some name"})

      assert %{"id" => _id, "name" => "some name", "el_id" => nil} =
               json_response(conn, 201)["data"]
    end

    test "initializes free subscription for organization", %{conn: conn, api_spec: api_spec} do
      conn =
        post(conn, ~p"/api/organizations", organization: %{name: "some name"})

      assert %{"id" => id, "name" => "some name", "el_id" => nil} =
               json_response(conn, 201)["data"]

      conn = get(conn, ~p"/api/organizations/#{id}/subscriptions")

      response = json_response(conn, 200)

      assert_schema response, "SubscriptionShowPlanResponse", api_spec

      {:ok, features} = Buildel.Subscriptions.Plan.get_features("free")

      assert %{
               "type" => "free",
               "status" => "active",
               "interval" => "month",
               "end_date" => _,
               "customer_id" => nil,
               "features" => db_features
             } = response["data"]

      Enum.each(features, fn {key, value} ->
        assert db_features[to_string(key)] == value
      end)
    end
  end

  describe "update" do
    test_requires_authentication %{conn: conn, organization: organization} do
      put(conn, ~p"/api/organizations/#{organization.id}", organization)
    end

    test_not_found %{conn: conn, another_organization: organization} do
      put(conn, ~p"/api/organizations/#{organization}", organization: %{name: "new name"})
    end

    test "returns the organization", %{conn: conn, organization: organization} do
      put(conn, ~p"/api/organizations/#{organization.id}", organization: %{name: "new name"})

      assert Organizations.get_organization!(organization.id).name == "new name"
    end
  end

  describe "get_api_key" do
    test_requires_authentication %{conn: conn, organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/api_key")
    end

    test_not_found %{conn: conn, another_organization: organization} do
      get(conn, ~p"/api/organizations/#{organization.id}/api_key")
    end

    test "returns the organization api key", %{conn: conn, organization: organization} do
      conn = get(conn, ~p"/api/organizations/#{organization.id}/api_key")

      assert json_response(conn, 200)["data"] == %{
               "key" => organization.api_key
             }
    end
  end

  describe "reset_api_key" do
    test_requires_authentication %{conn: conn, organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/api_key")
    end

    test_not_found %{conn: conn, another_organization: organization} do
      post(conn, ~p"/api/organizations/#{organization.id}/api_key")
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
    another_organization = organization_fixture()
    %{organization: organization, another_organization: another_organization}
  end
end
